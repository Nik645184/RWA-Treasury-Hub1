import { useState, useCallback } from 'react';
import { 
  useAccount, 
  useWriteContract, 
  useReadContract,
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

const gatewayClient = new GatewayClient();

export function useCircleGateway() {
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { writeContract, data: txHash } = useWriteContract();
  const [isProcessing, setIsProcessing] = useState(false);
  
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

  // Simple deposit to Gateway (for demo purposes)
  const depositToGateway = useCallback(async (amount: string) => {
    if (!address || !chain || !chainNetwork) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Processing deposit...');

    try {
      const usdcAddress = USDC_ADDRESSES[chainNetwork];
      const amountWei = parseUnits(amount, 6); // USDC has 6 decimals

      // For demo: just show instructions
      toast.info('To deposit USDC to Gateway:', { id: toastId });
      toast.info(`1. Approve ${amount} USDC to ${GATEWAY_WALLET_ADDRESS}`);
      toast.info(`2. Call deposit() on Gateway Wallet`);
      
      // You can uncomment below to actually execute transactions:
      /*
      writeContract({
        address: usdcAddress as Address,
        abi: erc20Abi,
        functionName: 'approve',
        args: [GATEWAY_WALLET_ADDRESS as Address, amountWei],
      });
      */
      
      return true;
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error(error?.message || 'Deposit failed', { id: toastId });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [address, chain, chainNetwork]);

  // Simple cross-chain transfer demo
  const transferCrossChain = useCallback(async (
    amount: string,
    sourceDomain: number,
    destinationDomain: number,
  ) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Initiating cross-chain transfer...');

    try {
      // For demo purposes, show the process
      toast.info('Cross-chain transfer process:', { id: toastId });
      toast.info('1. Sign burn intent with wallet');
      toast.info('2. Get attestation from Circle API');
      toast.info('3. Switch to destination chain');
      toast.info('4. Mint USDC on destination');
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Transfer of ${amount} USDC initiated!`, { id: toastId });
      return true;
    } catch (error: any) {
      console.error('Transfer error:', error);
      toast.error(error?.message || 'Transfer failed', { id: toastId });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [address]);

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