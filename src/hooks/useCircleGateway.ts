import { useState, useCallback } from 'react';
import { 
  useAccount, 
  useWriteContract, 
  useReadContract,
  useSignTypedData,
  useWaitForTransactionReceipt,
  usePublicClient,
  useWalletClient
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
  const { address, chain, connector } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync } = useWriteContract();
  const { signTypedDataAsync } = useSignTypedData();
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Deposit USDC to Gateway
  const depositToGateway = useCallback(async (amount: string) => {
    if (!address || !chain || !publicClient) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Processing deposit...');

    try {
      const network = getChainNetwork(chain.id);
      if (!network) {
        throw new Error('Unsupported chain');
      }
      
      const usdcAddress = USDC_ADDRESSES[network];
      const amountWei = parseUnits(amount, 6); // USDC has 6 decimals

      // Step 1: Approve USDC
      toast.loading('Approving USDC...', { id: toastId });
      const approveTx = await writeContractAsync({
        address: usdcAddress as Address,
        abi: erc20Abi,
        functionName: 'approve',
        args: [GATEWAY_WALLET_ADDRESS as Address, amountWei],
      });

      await publicClient.waitForTransactionReceipt({ hash: approveTx });

      // Step 2: Deposit to Gateway
      toast.loading('Depositing to Gateway...', { id: toastId });
      const depositTx = await writeContractAsync({
        address: GATEWAY_WALLET_ADDRESS as Address,
        abi: gatewayWalletAbi,
        functionName: 'deposit',
        args: [usdcAddress as Address, amountWei],
        chain,
      });

      await publicClient.waitForTransactionReceipt({ hash: depositTx });

      toast.success(`Successfully deposited ${amount} USDC to Gateway`, { id: toastId });
      return depositTx;
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error(error?.message || 'Deposit failed', { id: toastId });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [address, chain, publicClient, writeContractAsync]);

  // Transfer USDC between chains
  const transferCrossChain = useCallback(async (
    amount: string,
    sourceDomain: number,
    destinationDomain: number,
    destinationChainId: number
  ) => {
    if (!address || !walletClient || !publicClient) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Initiating cross-chain transfer...');

    try {
      const amountWei = parseUnits(amount, 6);
      
      // Get source and destination tokens
      const sourceNetwork = Object.entries(CHAIN_DOMAINS).find(([_, domain]) => domain === sourceDomain)?.[0];
      const destNetwork = Object.entries(CHAIN_DOMAINS).find(([_, domain]) => domain === destinationDomain)?.[0];
      
      if (!sourceNetwork || !destNetwork) {
        throw new Error('Invalid source or destination domain');
      }

      const sourceToken = USDC_ADDRESSES[sourceNetwork as keyof typeof USDC_ADDRESSES];
      const destToken = USDC_ADDRESSES[destNetwork as keyof typeof USDC_ADDRESSES];

      // Step 1: Create and sign burn intent
      toast.loading('Creating transfer intent...', { id: toastId });
      const burnIntent = createBurnIntent({
        sourceDomain,
        destinationDomain,
        sourceContract: GATEWAY_WALLET_ADDRESS,
        destinationContract: GATEWAY_MINTER_ADDRESS,
        sourceToken,
        destinationToken: destToken,
        sourceDepositor: address,
        destinationRecipient: address,
        amount: amountWei,
      });

      const typedData = burnIntentTypedData(burnIntent);
      
      toast.loading('Please sign the transfer intent...', { id: toastId });
      const signature = await signTypedDataAsync({
        ...typedData,
        account: address,
      });

      // Step 2: Request attestation from Gateway API
      toast.loading('Requesting attestation from Circle...', { id: toastId });
      const response = await gatewayClient.transfer({
        burnIntent: typedData.message,
        signature,
      });

      if (!response.success && response.message) {
        throw new Error(response.message);
      }

      // Step 3: Switch to destination chain
      toast.loading('Please switch to destination chain...', { id: toastId });
      await walletClient.switchChain({ id: destinationChainId });

      // Step 4: Mint on destination chain
      toast.loading('Minting USDC on destination chain...', { id: toastId });
      const mintTx = await writeContractAsync({
        address: GATEWAY_MINTER_ADDRESS as Address,
        abi: gatewayMinterAbi,
        functionName: 'gatewayMint',
        args: [response.attestation as `0x${string}`, response.signature as `0x${string}`],
      });

      await publicClient.waitForTransactionReceipt({ hash: mintTx });

      toast.success(`Successfully transferred ${amount} USDC cross-chain!`, { id: toastId });
      return mintTx;
    } catch (error: any) {
      console.error('Transfer error:', error);
      toast.error(error?.message || 'Transfer failed', { id: toastId });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [address, walletClient, publicClient, writeContractAsync, signTypedDataAsync]);

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
  };
}