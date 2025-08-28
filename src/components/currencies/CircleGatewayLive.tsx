import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
} from 'lucide-react';

// Chain configurations
const chains = [
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
    isProcessing,
  } = useCircleGateway();

  const [amount, setAmount] = useState('');
  const [fromChain, setFromChain] = useState(84532); // Base Sepolia
  const [toChain, setToChain] = useState(421614); // Arbitrum Sepolia
  const [unifiedBalances, setUnifiedBalances] = useState<any[]>([]);

  // Debug logging
  useEffect(() => {
    console.log('Connectors available:', connectors);
    console.log('Is connected:', isConnected);
    console.log('Connect error:', connectError);
  }, [connectors, isConnected, connectError]);

  // Fetch unified balance when connected
  useEffect(() => {
    if (isConnected && address) {
      getUnifiedBalance().then(balances => {
        if (balances) {
          setUnifiedBalances(balances);
        }
      });
    }
  }, [isConnected, address, getUnifiedBalance]);

  const handleConnect = async () => {
    try {
      console.log('Attempting to connect with connector:', connectors[0]);
      if (connectors[0]) {
        await connect({ connector: connectors[0] });
      } else {
        console.error('No connectors available');
      }
    } catch (error) {
      console.error('Connection error:', error);
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
    await transferCrossChain(amount, fromDomain, toDomain);
    setAmount('');
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const currentChain = chains.find(c => c.id === chainId);

  return (
    <div className="w-full space-y-6">
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
              
              <Button
                onClick={handleConnect}
                disabled={isPending || connectors.length === 0}
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
                    {connectors.length === 0 ? 'No Wallet Detected' : 'Connect Wallet'}
                  </>
                )}
              </Button>
              
              {connectors.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please install MetaMask or another Web3 wallet to continue.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Connected Account</p>
                  <p className="font-mono font-medium">{formatAddress(address!)}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm text-muted-foreground">Network</p>
                  <Badge variant="secondary">{currentChain?.name || 'Unknown'}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">USDC Balance</p>
                  <p className="text-lg font-bold">{parseFloat(usdcBalance).toFixed(2)} USDC</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Gateway Balance</p>
                  <p className="text-lg font-bold">{parseFloat(gatewayBalance).toFixed(2)} USDC</p>
                </div>
              </div>

              <Button
                onClick={() => disconnect()}
                variant="outline"
                className="w-full"
              >
                Disconnect Wallet
              </Button>
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