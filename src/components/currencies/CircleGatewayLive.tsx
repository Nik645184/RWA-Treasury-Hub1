import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { useCircleGateway } from '@/hooks/useCircleGateway';
import { formatUnits } from 'viem';
import {
  ArrowRight,
  Wallet,
  Globe,
  Zap,
  Shield,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  Link,
  ExternalLink,
  Activity,
  LogOut,
} from 'lucide-react';

// Chain configurations
const chains = [
  // Mainnet chains
  { id: 1, name: 'Ethereum', domain: 0, color: 'bg-indigo-500', isMainnet: true },
  { id: 8453, name: 'Base', domain: 6, color: 'bg-blue-500', isMainnet: true },
  // Testnet chains
  { id: 84532, name: 'Base Sepolia', domain: 6, color: 'bg-blue-500' },
  { id: 421614, name: 'Arbitrum Sepolia', domain: 3, color: 'bg-orange-500' },
  { id: 43113, name: 'Avalanche Fuji', domain: 1, color: 'bg-red-500' },
  { id: 11155111, name: 'Ethereum Sepolia', domain: 0, color: 'bg-indigo-500' },
];

const CircleGatewayLive = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error: connectError, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const {
    usdcBalance,
    gatewayBalance,
    depositToGateway,
    transferCrossChain,
    getUnifiedBalance,
    unifiedBalances,
    isProcessing,
  } = useCircleGateway();

  const [amount, setAmount] = useState('');
  const [fromChain, setFromChain] = useState(84532); // Base Sepolia
  const [toChain, setToChain] = useState(421614); // Arbitrum Sepolia

  // Debug logging
  useEffect(() => {
    console.log('Connectors available:', connectors);
    console.log('Is connected:', isConnected);
    console.log('Connect error:', connectError);
  }, [connectors, isConnected, connectError]);

  // Fetch unified balance when connected and periodically
  useEffect(() => {
    // Initial fetch when component mounts
    if (isConnected && address && unifiedBalances) {
      getUnifiedBalance();
    }
    
    const interval = setInterval(() => {
      if (isConnected && address) {
        getUnifiedBalance();
      }
    }, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(interval);
  }, [isConnected, address, getUnifiedBalance, chainId]);

  const handleConnect = async (connectorId?: string) => {
    try {
      console.log('Available connectors:', connectors);
      
      // Find specific connectors
      const walletConnectConnector = connectors.find(c => c.id === 'walletConnect' || c.id === 'com.walletconnect');
      const injectedConnector = connectors.find(c => c.id === 'injected' || c.id === 'com.injected');
      
      let selectedConnector;
      
      // If WalletConnect specifically requested or on mobile without injected wallet
      if (connectorId === 'walletConnect') {
        selectedConnector = walletConnectConnector;
        if (!selectedConnector) {
          alert('WalletConnect is not available. Please try refreshing the page.');
          return;
        }
      } else if (window.ethereum && injectedConnector) {
        selectedConnector = injectedConnector;
      } else if (walletConnectConnector) {
        // Fallback to WalletConnect if no injected wallet
        selectedConnector = walletConnectConnector;
      }
      
      if (selectedConnector) {
        console.log('Connecting with:', selectedConnector.id, selectedConnector.name);
        await connect({ connector: selectedConnector });
      } else {
        console.error('No suitable connector found');
        alert('No wallet connector available. Please install MetaMask or use WalletConnect.');
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      
      // Handle specific error cases silently - user rejection is a normal action
      if (error?.message?.includes('User rejected') || error?.message?.includes('user rejected')) {
        console.log('User cancelled connection');
        // Don't show error to user - this is a normal user action
        return;
      } else if (error?.message?.includes('WalletConnect')) {
        alert('WalletConnect error. Please try again or use MetaMask.');
      } else {
        alert(`Connection failed: ${error?.message || 'Unknown error'}`);
      }
    }
  };

  const handleDeposit = async () => {
    if (!amount) return;
    await depositToGateway(amount);
    setAmount('');
  };

  const handleTransfer = async () => {
    if (!amount) return;
    const fromDomain = chains.find(c => c.id === fromChain)?.domain || 0;
    const toDomain = chains.find(c => c.id === toChain)?.domain || 0;
    // Pass the destination chain ID as the 4th parameter
    await transferCrossChain(amount, fromDomain, toDomain, toChain);
    setAmount('');
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const currentChain = chains.find(c => c.id === chainId);

  return (
    <div className="w-full space-y-6">
      {/* Header with wallet status and disconnect */}
      {isConnected && (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Wallet Connected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Address:</span>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{formatAddress(address!)}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Network:</span>
                    <Select 
                      value={chainId?.toString()} 
                      onValueChange={(value) => switchChain?.({ chainId: Number(value) })}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue>
                          <Badge variant={currentChain ? "default" : "destructive"}>
                            {currentChain?.name || `Chain ID: ${chainId}`}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {chains.map((chain) => (
                          <SelectItem key={chain.id} value={chain.id.toString()}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${chain.color}`} />
                              {chain.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button
                  onClick={() => disconnect()}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Disconnect
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Unified Balance Card - Primary Focus */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Unified Balance (All Gateway Wallets)
                    </p>
                  </div>
                  <p className="text-4xl font-bold text-primary">
                    {unifiedBalances && unifiedBalances.length > 0 
                      ? unifiedBalances.reduce((sum, b) => sum + parseFloat(b.balance || '0'), 0).toFixed(6) 
                      : '0.000000'} USDC
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Instantly accessible across all supported chains
                  </p>
                  {/* Debug info */}
                  <div className="text-xs text-muted-foreground space-y-1 mt-2 p-2 bg-muted/50 rounded">
                    <p>Connected to: {currentChain?.name || 'Unknown'} (ID: {chainId})</p>
                    <p>Network Type: {currentChain?.isMainnet ? 'Mainnet' : 'Testnet'}</p>
                    <p>Gateway Contract Balance: {gatewayBalance} USDC</p>
                    <p>API Data Source: {currentChain?.isMainnet ? 'Mainnet API' : 'Testnet API'}</p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Badge variant="outline" className="border-primary/20">
                    <Zap className="h-3 w-3 mr-1" />
                    Instant Transfer
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Active on {unifiedBalances.filter(b => parseFloat(b.balance) > 0).length} chain(s)
                  </p>
                </div>
              </div>
              
              {/* Breakdown by chain */}
              {unifiedBalances && unifiedBalances.length > 0 && (
                <div className="mt-4 pt-4 border-t space-y-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Balance Distribution (from API):</p>
                  {unifiedBalances.map((balance) => {
                    const chain = chains.find(c => c.domain === balance.domain);
                    const isCurrentChain = chain && currentChain && chain.domain === currentChain.domain;
                    return (
                      <div key={balance.domain} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${chain?.color || 'bg-gray-500'}`} />
                          <span className="text-sm">
                            {chain?.name || `Domain ${balance.domain}`}
                            {isCurrentChain && (
                              <Badge variant="secondary" className="ml-2 text-xs">Current</Badge>
                            )}
                          </span>
                        </div>
                        <span className="text-sm font-mono">{parseFloat(balance.balance).toFixed(6)} USDC</span>
                      </div>
                    );
                  })}
                  
                  {/* Gateway Wallet Contract Addresses */}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Gateway Wallet Contract Addresses:</p>
                    <div className="space-y-1">
                      <div className="text-xs">
                        <span className="text-muted-foreground">Testnet: </span>
                        <code className="bg-muted px-1 py-0.5 rounded">0x0077777d7EBA4688BDeF3E311b846F25870A19B9</code>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Mainnet: </span>
                        <code className="bg-muted px-1 py-0.5 rounded">0x77777777Dcc4d5A8B6E418Fd04D8997ef11000eE</code>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Your USDC is stored in these non-custodial smart contracts across all supported chains.
                      </p>
                      {currentChain?.isMainnet && unifiedBalances.some(b => parseFloat(b.balance) > 0) && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-3 w-3" />
                          <AlertDescription className="text-xs">
                            Note: You're on mainnet but the API shows testnet balances. Make sure you're querying the correct network.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Wallet Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connection
          </CardTitle>
          <CardDescription>
            Connect your wallet to interact with Circle Gateway
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Connect your MetaMask wallet to deposit and transfer USDC across chains.
                  Make sure you have testnet USDC and native tokens for gas.
                </AlertDescription>
              </Alert>
              
              {connectError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Error: {connectError.message}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-3">
                <Button
                  onClick={() => handleConnect()}
                  disabled={isPending}
                  className="w-full"
                  size="lg"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-4 w-4" />
                      {window.ethereum ? 'Connect MetaMask' : 'Connect Wallet'}
                    </>
                  )}
                </Button>
                
                {connectors.find(c => c.id === 'walletConnect') && (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or use mobile wallet</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleConnect('walletConnect')}
                      disabled={isPending}
                      variant="outline"
                      className="w-full"
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect with WalletConnect
                    </Button>
                  </>
                )}
              </div>
              
              {!window.ethereum && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Desktop wallet not detected. You can connect using:
                    <ul className="mt-2 space-y-1">
                      <li>• WalletConnect with your mobile wallet</li>
                      <li>• <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="underline">Install MetaMask extension</a></li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Wallet successfully connected! You can now deposit USDC to Gateway or transfer between chains.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">USDC Balance</p>
                  <p className="text-lg font-bold">{parseFloat(usdcBalance).toFixed(2)} USDC</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Gateway Balance ({currentChain?.name || 'Current Chain'})</p>
                  <p className="text-lg font-bold">{parseFloat(gatewayBalance).toFixed(2)} USDC</p>
                  <p className="text-xs text-muted-foreground">On this network only</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Gateway Interface */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Circle Gateway Operations
            </CardTitle>
            <CardDescription>
              Deposit USDC to Gateway or transfer between chains instantly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="deposit" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="deposit">Deposit</TabsTrigger>
                <TabsTrigger value="transfer">Transfer</TabsTrigger>
                <TabsTrigger value="balances">Balances</TabsTrigger>
              </TabsList>

              <TabsContent value="deposit" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Deposit Amount
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter USDC amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Depositing USDC to Gateway creates a unified balance accessible across all supported chains.
                      Make sure you have approved the Gateway contract first.
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={handleDeposit}
                    disabled={!amount || isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Deposit to Gateway
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="transfer" className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">From Chain</label>
                      <Select value={fromChain.toString()} onValueChange={(v) => setFromChain(Number(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {chains.map((chain) => (
                            <SelectItem key={chain.id} value={chain.id.toString()}>
                              {chain.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">To Chain</label>
                      <Select value={toChain.toString()} onValueChange={(v) => setToChain(Number(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {chains.filter(c => c.id !== fromChain).map((chain) => (
                            <SelectItem key={chain.id} value={chain.id.toString()}>
                              {chain.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Transfer Amount
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter USDC amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Transfer Speed</span>
                      <span className="font-medium flex items-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        Instant (&lt;500ms)
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Estimated Fee</span>
                      <span className="font-medium">~2.01 USDC</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleTransfer}
                    disabled={!amount || isProcessing || fromChain === toChain}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Transfer Cross-Chain
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="balances" className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-medium">Unified Balance Across Chains</h3>
                  {unifiedBalances.length > 0 ? (
                    unifiedBalances.map((balance, idx) => {
                      const chain = chains.find(c => c.domain === balance.domain);
                      return (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${chain?.color || 'bg-gray-500'}`} />
                            <span className="font-medium">
                              {chain?.name || `Domain ${balance.domain}`}
                            </span>
                          </div>
                          <span className="font-mono font-bold">
                            {balance.balance} USDC
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No Gateway balances found</p>
                      <p className="text-sm mt-1">Deposit USDC to get started</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Instant Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Transfer USDC between chains in under 500ms with Circle Gateway's attestation system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              Non-Custodial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Maintain full control of your funds with trustless withdrawals and user signatures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              7+ Chains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Supported on Ethereum, Base, Arbitrum, Avalanche, OP, Polygon, and Unichain
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Developer Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="https://developers.circle.com/circle-gateway/docs" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1 h-3 w-3" />
                Documentation
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1 h-3 w-3" />
                USDC Faucet
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://sepolia.basescan.org/address/0x0077777d7EBA4688BDeF3E311b846F25870A19B9" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1 h-3 w-3" />
                Gateway Contract
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CircleGatewayLive;
