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

  // Check if current chain is mainnet - include all mainnet chain IDs
  const isMainnet = chain ? [1, 8453, 42161, 43114, 10, 137, 110].includes(chain.id) : false;
  
  // Create Gateway client with proper network detection
  const gatewayClient = new GatewayClient(isMainnet);
  console.log('Gateway Client created:', { chainId: chain?.id, isMainnet });
  
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

  // Get unified balance across all chains - define before useEffect
  const getUnifiedBalance = useCallback(async () => {
    if (!address) return null;

    try {
      const response = await gatewayClient.balances('USDC', address);
      console.log('Unified balances fetched:', response);
      return response.balances;
    } catch (error) {
      console.error('Failed to fetch unified balance:', error);
      return null;
    }
  }, [address, gatewayClient]);

  // Fetch unified balances on address/chain change + auto-refresh
  useEffect(() => {
    const fetchBalances = async () => {
      if (address) {
        const balances = await getUnifiedBalance();
        if (balances) {
          console.log('Auto-refresh Gateway balances at', new Date().toISOString(), balances);
          setUnifiedBalances(balances);
        }
      }
    };
    
    // Initial fetch
    fetchBalances();
    
    // Set up auto-refresh every 5 seconds for better UX
    const interval = setInterval(fetchBalances, 5000);
    
    return () => clearInterval(interval);
  }, [address, chain?.id, getUnifiedBalance]);

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
      
      // Clear processing state immediately after success
      setIsProcessing(false);
      setPendingDeposit({ hash: depositTx, amount });
      toast.success(`Successfully deposited ${amount} USDC to Gateway!`, { id: toastId });
      
      // Immediately try to refresh balances
      toast.loading('Updating balances...', { id: 'balance-refresh' });
      
      // First quick check
      const quickCheck = await getUnifiedBalance();
      if (quickCheck) {
        setUnifiedBalances(quickCheck);
        toast.dismiss('balance-refresh');
      }
      
      // Get current chain domain - map chainId to domain
      let currentDomain = 0;
      if (chain.id === 1 || chain.id === 11155111) currentDomain = 0; // Ethereum/Sepolia
      else if (chain.id === 43114 || chain.id === 43113) currentDomain = 1; // Avalanche
      else if (chain.id === 8453 || chain.id === 84532) currentDomain = 6; // Base
      else if (chain.id === 10) currentDomain = 2; // Optimism
      else if (chain.id === 42161) currentDomain = 3; // Arbitrum
      else if (chain.id === 137) currentDomain = 7; // Polygon
      
      // Track pending deposit
      const pendingKey = `pending-${currentDomain}-${Date.now()}`;
      
      // Base has fast finality but Gateway still requires L1 finality
      const finalityTime = currentDomain === 6 ? "13-19 minutes (waiting for Ethereum L1 finality)" : "a few minutes";
      
      toast.loading(`✅ Deposit transaction confirmed on ${chain?.name}! Waiting for Circle Gateway finalization (${finalityTime})...`, { 
        id: pendingKey,
        duration: 300000 // Show for 5 minutes
      });
      
      // Start aggressive polling immediately for Base
      const checkIntervals = [
        1000, 2000, 3000, 5000, 8000, // First 5 checks in 8 seconds
        15000, 30000, 45000, 60000,    // Then every 15-60 seconds
        90000, 120000, 180000, 240000, // Then less frequently
        300000, 420000, 540000, 660000, 780000, 900000 // up to 15 minutes
      ];
      
      let foundUpdate = false;
      checkIntervals.forEach(delay => {
        setTimeout(async () => {
          if (foundUpdate) return; // Stop checking once found
          
          const balances = await getUnifiedBalance();
          if (balances) {
            console.log(`Balance check at ${delay/1000}s:`, balances);
            setUnifiedBalances(balances);
            
            // Check if deposit is now visible on the specific chain
            const chainBalance = balances.find((b: any) => b.domain === currentDomain);
            const currentAmount = chainBalance ? parseFloat(chainBalance.balance) : 0;
            
            // For the initial deposit, any amount > 0 is an update
            // For subsequent deposits, check against previous balance
            const previousBalance = unifiedBalances.find((b: any) => b.domain === currentDomain);
            const previousAmount = previousBalance ? parseFloat(previousBalance.balance) : 0;
            
            if (currentAmount > previousAmount) {
              foundUpdate = true;
              toast.dismiss(pendingKey);
              toast.success(`✅ Gateway balance updated! ${chain?.name}: ${currentAmount.toFixed(6)} USDC (+ ${(currentAmount - previousAmount).toFixed(6)} USDC)`, { 
                id: 'balance-refresh',
                duration: 8000 
              });
            } else if (delay >= 60000 && !foundUpdate) {
              // After 1 minute, show status update
              toast.loading(`Still waiting for Gateway finalization on ${chain?.name}. Current status: Transaction confirmed, awaiting L1 finality...`, {
                id: pendingKey,
                duration: 180000
              });
            }
          }
        }, delay);
      });
      
      return true;
    } catch (error: any) {
      console.error('Deposit error:', error);
      setIsProcessing(false);
      toast.error(error?.shortMessage || error?.message || 'Deposit failed', { id: toastId });
      return false;
    }
  }, [address, chain, usdcAddress, walletClient, publicClient, gatewayWalletAddress]);

  // Real cross-chain transfer with burn intents
  const transferCrossChain = useCallback(async (
    amount: string,
    sourceDomain: number,
    destinationDomain: number,
    destinationChainId: number,
  ) => {
    if (!address || !walletClient || !usdcAddress) {
      toast.error('Please connect your wallet and select a network');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Checking Gateway balance...');

    try {
      // Log detailed balance check
      console.log('Checking balance for transfer:', {
        address,
        sourceDomain,
        amount,
        isMainnet,
        gatewayEndpoint: isMainnet ? 'mainnet' : 'testnet'
      });
      
      // First check if we have sufficient balance
      const balances = await gatewayClient.balances('USDC', address);
      console.log('Gateway balances response:', balances);
      
      const sourceBalance = balances.balances.find(b => b.domain === sourceDomain);
      const requiredAmount = parseFloat(amount) + 0.01; // Add fee buffer
      
      console.log('Balance check:', {
        sourceBalance,
        requiredAmount,
        hasBalance: sourceBalance && parseFloat(sourceBalance.balance) >= requiredAmount
      });
      
      if (!sourceBalance || parseFloat(sourceBalance.balance) < requiredAmount) {
        const availableBalance = sourceBalance ? sourceBalance.balance : '0';
        throw new Error(
          `Insufficient Gateway balance on domain ${sourceDomain}. Available: ${availableBalance} USDC, Required: ${requiredAmount} USDC. ` +
          `Please wait for block finality (up to 20 minutes on Ethereum) or deposit more USDC.`
        );
      }

      const destUsdcAddress = getUsdcAddress(destinationChainId);
      if (!destUsdcAddress) {
        throw new Error('USDC not supported on destination chain');
      }

      // Step 1: Create burn intent with proper fee
      toast.loading('Step 1/4: Creating burn intent...', { id: toastId });
      const burnIntent = createBurnIntent({
        sourceDomain,
        destinationDomain,
        sourceContract: gatewayWalletAddress,
        destinationContract: gatewayMinterAddress,
        sourceToken: usdcAddress,
        destinationToken: destUsdcAddress,
        sourceDepositor: address,
        destinationRecipient: address,
        amount,
      }, isMainnet); // Pass isMainnet to use proper fees

      // Step 2: Sign burn intent with better error handling
      toast.loading('Step 2/4: Preparing signature request...', { id: toastId });
      console.log('Creating typed data for burn intent:', JSON.stringify(burnIntent, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
      
      const typedData = burnIntentTypedData(burnIntent);
      console.log('Typed data created, types:', typedData.types);
      console.log('Domain:', typedData.domain);
      
      // Convert values to strings for API
      const messageForApi = JSON.parse(JSON.stringify(typedData.message, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
      
      let signature: `0x${string}`;
      toast.loading('Step 2/4: Waiting for wallet signature...', { id: toastId });
      
      try {
        console.log('Starting signature request process...');
        
        // For MetaMask, we need all BigInt values as strings
        const messageForSigning = JSON.parse(JSON.stringify(typedData.message, (key, value) => {
          if (typeof value === 'bigint') {
            return value.toString();
          }
          return value;
        }));
        
        console.log('Message for signing:', messageForSigning);
        
        const signatureRequest = {
          account: address as Address,
          domain: typedData.domain,
          types: typedData.types,
          primaryType: 'BurnIntent' as const,
          message: messageForSigning,
        };
        
        console.log('Calling walletClient.signTypedData...');
        
        try {
          // Try signing with a timeout
          const signPromise = walletClient.signTypedData(signatureRequest as any);
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Signature timeout after 30 seconds')), 30000);
          });
          
          signature = await Promise.race([signPromise, timeoutPromise]) as `0x${string}`;
          console.log('✅ Signature received successfully:', signature);
          
        } catch (timeoutError: any) {
          console.error('Signature attempt failed:', timeoutError);
          throw timeoutError;
        }
        
      } catch (signError: any) {
        console.error('Error signing burn intent:', signError);
        toast.dismiss(toastId);
        if (signError?.message?.includes('timeout')) {
          toast.error('Wallet signature timeout - please check your wallet and try again');
          throw new Error('Wallet signature timeout');
        }
        if (signError?.message?.includes('User rejected') || signError?.message?.includes('User denied')) {
          toast.error('Transaction cancelled by user');
          throw new Error('Transaction cancelled by user');
        }
        toast.error(`Failed to sign: ${signError?.message || 'Unknown error'}`);
        throw new Error(`Failed to sign transaction: ${signError?.message || 'Unknown error'}`);
      }

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
      
      // Return mint transaction hash for tracking
      const receipt = await publicClient?.waitForTransactionReceipt({ hash: mintTx });
      
      toast.success(`Successfully transferred ${amount} USDC cross-chain!`, { id: toastId });
      
      // Immediately refresh balances  
      const quickCheck = await getUnifiedBalance();
      if (quickCheck) {
        setUnifiedBalances(quickCheck);
      }
      
      // Schedule additional checks for finality
      [5000, 15000, 30000].forEach(delay => {
        setTimeout(async () => {
          const balances = await getUnifiedBalance();
          if (balances) setUnifiedBalances(balances);
        }, delay);
      });
      
      // Return the mint transaction hash
      return mintTx;
    } catch (error: any) {
      console.error('Transfer error:', error);
      toast.error(error?.message || 'Transfer failed', { id: toastId });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [address, walletClient, chain, usdcAddress, switchChain, publicClient, gatewayWalletAddress, gatewayMinterAddress, gatewayClient]);


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