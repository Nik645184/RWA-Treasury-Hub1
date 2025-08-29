import { useState, useCallback, useEffect } from 'react';
import { 
  useAccount, 
  useWriteContract, 
  useReadContract,
  useWaitForTransactionReceipt,
  usePublicClient,
  useWalletClient,
  useSwitchChain
} from 'wagmi';
import { parseUnits, formatUnits, type Address } from 'viem';
import { toast } from 'sonner';
import { 
  getGatewayWalletAddress,
  getGatewayMinterAddress,
  getUsdcAddress,
  CHAIN_DOMAINS 
} from '@/lib/circle-gateway/constants';
import { gatewayWalletAbi, gatewayMinterAbi, erc20Abi } from '@/lib/circle-gateway/abis';
import { GatewayClient } from '@/lib/circle-gateway/gateway-client';
import { createBurnIntent, burnIntentTypedData } from '@/lib/circle-gateway/burn-intent';

export function useCircleGateway() {
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { writeContract, data: txHash } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const [isProcessing, setIsProcessing] = useState(false);
  const [unifiedBalances, setUnifiedBalances] = useState<any[]>([]);
  const [pendingDeposit, setPendingDeposit] = useState<{ hash: string, amount: string } | null>(null);
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Check if current chain is mainnet
  const isMainnet = chain ? [1, 8453].includes(chain.id) : false;
  
  // Create Gateway client
  const gatewayClient = new GatewayClient(isMainnet);
  
  // Get USDC address for current chain
  const usdcAddress = chain ? getUsdcAddress(chain.id) : undefined;
  
  // Get Gateway addresses
  const gatewayWalletAddress = getGatewayWalletAddress(isMainnet);
  const gatewayMinterAddress = getGatewayMinterAddress(isMainnet);

  // Get USDC balance on current chain
  const { data: usdcBalance } = useReadContract({
    address: usdcAddress as Address | undefined,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Get Gateway balance on current chain  
  const { data: gatewayBalance } = useReadContract({
    address: gatewayWalletAddress as Address,
    abi: gatewayWalletAbi,
    functionName: 'availableBalance',
    args: address && usdcAddress ? [
      usdcAddress as Address,
      address
    ] : undefined,
  });

  // Fetch unified balances on address change
  useEffect(() => {
    if (address) {
      getUnifiedBalance().then(balances => {
        if (balances) {
          setUnifiedBalances(balances);
        }
      });
    }
  }, [address]);

  // Real deposit to Gateway
  const depositToGateway = useCallback(async (amount: string) => {
    if (!address || !chain || !usdcAddress || !walletClient) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Step 1/2: Approving USDC...');

    try {
      const amountWei = parseUnits(amount, 6); // USDC has 6 decimals
      
      // Step 1: Approve USDC
      const approveTx = await walletClient.writeContract({
        chain,
        account: address,
        address: usdcAddress as Address,
        abi: erc20Abi,
        functionName: 'approve',
        args: [gatewayWalletAddress as Address, amountWei],
      });
      
      toast.loading('Waiting for approval confirmation...', { id: toastId });
      await publicClient?.waitForTransactionReceipt({ hash: approveTx });
      
      // Step 2: Deposit to Gateway
      toast.loading('Step 2/2: Depositing to Gateway...', { id: toastId });
      const depositTx = await walletClient.writeContract({
        chain,
        account: address,
        address: gatewayWalletAddress as Address,
        abi: gatewayWalletAbi,
        functionName: 'deposit',
        args: [usdcAddress as Address, amountWei],
      });
      
      toast.loading('Waiting for deposit confirmation...', { id: toastId });
      await publicClient?.waitForTransactionReceipt({ hash: depositTx });
      
      setPendingDeposit({ hash: depositTx, amount });
      toast.success(`Successfully deposited ${amount} USDC to Gateway!`, { id: toastId });
      
      // Start polling for balance updates (chain finality can take 15-20 min)
      toast.info('Balance will update after chain finality (~15-20 minutes)', { duration: 10000 });
      
      return true;
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error(error?.shortMessage || error?.message || 'Deposit failed', { id: toastId });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [address, chain, usdcAddress, walletClient, publicClient, gatewayWalletAddress]);

  // Real cross-chain transfer with burn intents
  const transferCrossChain = useCallback(async (
    amount: string,
    sourceDomain: number,
    destinationDomain: number,
    destinationChainId: number,
    sourceChainId: number,
  ) => {
    if (!address || !walletClient) {
      toast.error('Please connect your wallet and select a network');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Step 1/4: Creating burn intent...');

    try {
      const sourceUsdcAddress = getUsdcAddress(sourceChainId);
      const destUsdcAddress = getUsdcAddress(destinationChainId);
      
      if (!sourceUsdcAddress) {
        throw new Error('USDC not supported on source chain');
      }
      if (!destUsdcAddress) {
        throw new Error('USDC not supported on destination chain');
      }

      // Step 1: Create burn intent
      const burnIntent = createBurnIntent({
        sourceDomain,
        destinationDomain,
        sourceContract: gatewayWalletAddress,
        destinationContract: gatewayMinterAddress,
        sourceToken: sourceUsdcAddress,
        destinationToken: destUsdcAddress,
        sourceDepositor: address,
        destinationRecipient: address,
        amount,
      });

      // Step 2: Sign burn intent
      toast.loading('Step 2/4: Signing burn intent...', { id: toastId });
      const typedData = burnIntentTypedData(burnIntent);
      
      // Convert values to strings for API
      const messageForApi = {
        ...typedData.message,
        maxBlockHeight: typedData.message.maxBlockHeight.toString(),
        maxFee: typedData.message.maxFee.toString(),
        spec: {
          ...typedData.message.spec,
          value: typedData.message.spec.value.toString(),
        }
      };
      
      const signature = await walletClient.signTypedData({
        account: address,
        domain: typedData.domain as any,
        primaryType: typedData.primaryType,
        types: typedData.types,
        message: typedData.message,
      });

      // Step 3: Get attestation from Gateway API
      toast.loading('Step 3/4: Getting attestation from Circle...', { id: toastId });
      const transferResponse = await gatewayClient.transfer([{
        burnIntent: messageForApi,
        signature,
      }]);

      if (!transferResponse.attestation || transferResponse.success === false) {
        throw new Error(transferResponse.message || 'Failed to get attestation');
      }

      // Step 4: Switch to destination chain and mint
      toast.loading('Step 4/4: Switching to destination chain...', { id: toastId });
      
      if (chain?.id !== destinationChainId) {
        await switchChain?.({ chainId: destinationChainId });
        // Wait for chain switch
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Mint on destination chain
      toast.loading('Minting USDC on destination chain...', { id: toastId });
      const mintTx = await walletClient.writeContract({
        chain: { id: destinationChainId } as any,
        account: address,
        address: gatewayMinterAddress as Address,
        abi: gatewayMinterAbi,
        functionName: 'gatewayMint',
        args: [transferResponse.attestation as `0x${string}`, transferResponse.signature as `0x${string}`],
      });

      toast.loading('Waiting for mint confirmation...', { id: toastId });
      await publicClient?.waitForTransactionReceipt({ hash: mintTx });
      
      toast.success(`Successfully transferred ${amount} USDC cross-chain!`, { id: toastId });
      
      // Note about balance updates
      toast.info('Balance will update after chain finality (~15-20 minutes)', { duration: 10000 });
      
      return true;
    } catch (error: any) {
      console.error('Transfer error:', error);
      toast.error(error?.shortMessage || error?.message || 'Transfer failed', { id: toastId });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [address, walletClient, chain, usdcAddress, switchChain, publicClient, gatewayWalletAddress, gatewayMinterAddress]);

  // Get unified balance across all chains
  const getUnifiedBalance = useCallback(async () => {
    if (!address) return null;

    try {
      const response = await gatewayClient.balances('USDC', address);
      return response.balances;
    } catch (error) {
      console.error('Failed to fetch unified balance:', error);
      return null;
    }
  }, [address, gatewayClient]);

  return {
    address,
    chain,
    usdcBalance: usdcBalance ? formatUnits(usdcBalance, 6) : '0',
    gatewayBalance: gatewayBalance ? formatUnits(gatewayBalance, 6) : '0',
    unifiedBalances,
    depositToGateway,
    transferCrossChain,
    getUnifiedBalance,
    isProcessing,
    isConfirming,
    isSuccess,
  };
}