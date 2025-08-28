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
  GATEWAY_WALLET_ADDRESS, 
  GATEWAY_MINTER_ADDRESS,
  USDC_ADDRESSES,
  CHAIN_DOMAINS 
} from '@/lib/circle-gateway/constants';
import { gatewayWalletAbi, gatewayMinterAbi, erc20Abi } from '@/lib/circle-gateway/abis';
import { GatewayClient } from '@/lib/circle-gateway/gateway-client';
import { createBurnIntent, burnIntentTypedData } from '@/lib/circle-gateway/burn-intent';

const gatewayClient = new GatewayClient();

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

  // Get chain network name
  const getChainNetwork = (chainId: number): keyof typeof USDC_ADDRESSES | undefined => {
    switch (chainId) {
      case 11155111: return 'sepolia';
      case 84532: return 'baseSepolia';
      case 43113: return 'avalancheFuji';
      case 421614: return 'arbitrumSepolia';
      default: return undefined;
    }
  };

  const chainNetwork = chain ? getChainNetwork(chain.id) : undefined;

  // Get USDC balance on current chain
  const { data: usdcBalance } = useReadContract({
    address: chainNetwork ? USDC_ADDRESSES[chainNetwork] : undefined,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Get Gateway balance on current chain
  const { data: gatewayBalance } = useReadContract({
    address: GATEWAY_WALLET_ADDRESS as Address,
    abi: gatewayWalletAbi,
    functionName: 'availableBalance',
    args: address && chainNetwork ? [
      USDC_ADDRESSES[chainNetwork],
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
    if (!address || !chain || !chainNetwork || !walletClient) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Step 1/2: Approving USDC...');

    try {
      const usdcAddress = USDC_ADDRESSES[chainNetwork] as Address;
      const amountWei = parseUnits(amount, 6); // USDC has 6 decimals
      
      // Step 1: Approve USDC
      const approveTx = await walletClient.writeContract({
        chain,
        account: address,
        address: usdcAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [GATEWAY_WALLET_ADDRESS as Address, amountWei],
      });
      
      toast.loading('Waiting for approval confirmation...', { id: toastId });
      await publicClient?.waitForTransactionReceipt({ hash: approveTx });
      
      // Step 2: Deposit to Gateway
      toast.loading('Step 2/2: Depositing to Gateway...', { id: toastId });
      const depositTx = await walletClient.writeContract({
        chain,
        account: address,
        address: GATEWAY_WALLET_ADDRESS as Address,
        abi: gatewayWalletAbi,
        functionName: 'deposit',
        args: [usdcAddress, amountWei],
      });
      
      toast.loading('Waiting for deposit confirmation...', { id: toastId });
      await publicClient?.waitForTransactionReceipt({ hash: depositTx });
      
      setPendingDeposit({ hash: depositTx, amount });
      toast.success(`Successfully deposited ${amount} USDC to Gateway!`, { id: toastId });
      
      // Refresh balances after a delay (for chain finality)
      setTimeout(() => {
        getUnifiedBalance().then(balances => {
          if (balances) setUnifiedBalances(balances);
        });
      }, 5000);
      
      return true;
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error(error?.shortMessage || error?.message || 'Deposit failed', { id: toastId });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [address, chain, chainNetwork, walletClient, publicClient]);

  // Real cross-chain transfer with burn intents
  const transferCrossChain = useCallback(async (
    amount: string,
    sourceDomain: number,
    destinationDomain: number,
    destinationChainId: number,
  ) => {
    if (!address || !walletClient || !chainNetwork) {
      toast.error('Please connect your wallet and select a network');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Step 1/4: Creating burn intent...');

    try {
      // Step 1: Create burn intent
      const burnIntent = createBurnIntent({
        sourceDomain,
        destinationDomain,
        sourceContract: GATEWAY_WALLET_ADDRESS,
        destinationContract: GATEWAY_MINTER_ADDRESS,
        sourceToken: USDC_ADDRESSES[chainNetwork],
        destinationToken: USDC_ADDRESSES[getChainNetwork(destinationChainId) || 'sepolia'],
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
      const transferResponse = await gatewayClient.transfer({
        burnIntent: messageForApi,
        signature,
      });

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
        address: GATEWAY_MINTER_ADDRESS as Address,
        abi: gatewayMinterAbi,
        functionName: 'gatewayMint',
        args: [transferResponse.attestation as `0x${string}`, transferResponse.signature as `0x${string}`],
      });

      toast.loading('Waiting for mint confirmation...', { id: toastId });
      await publicClient?.waitForTransactionReceipt({ hash: mintTx });
      
      toast.success(`Successfully transferred ${amount} USDC cross-chain!`, { id: toastId });
      
      // Refresh balances
      setTimeout(() => {
        getUnifiedBalance().then(balances => {
          if (balances) setUnifiedBalances(balances);
        });
      }, 5000);
      
      return true;
    } catch (error: any) {
      console.error('Transfer error:', error);
      toast.error(error?.shortMessage || error?.message || 'Transfer failed', { id: toastId });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [address, walletClient, chain, chainNetwork, switchChain, publicClient]);

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
  }, [address]);

  return {
    address,
    chain,
    usdcBalance: usdcBalance ? formatUnits(usdcBalance, 6) : '0',
    gatewayBalance: gatewayBalance ? formatUnits(gatewayBalance, 6) : '0',
    depositToGateway,
    transferCrossChain,
    getUnifiedBalance,
    isProcessing,
    isConfirming,
    isSuccess,
  };
}