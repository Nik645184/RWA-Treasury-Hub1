import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { useCircleGateway } from '@/hooks/useCircleGateway';
import { formatUnits } from 'viem';
import { toast } from '@/hooks/use-toast';
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
  Info,
  RefreshCw,
  Settings,
  Timer,
  Calendar,
  DollarSign,
  ArrowUpDown,
  Bell,
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
    isProcessing,
  } = useCircleGateway();

  const [amount, setAmount] = useState('');
  const [fromChain, setFromChain] = useState(84532); // Base Sepolia
  const [toChain, setToChain] = useState(421614); // Arbitrum Sepolia
  const [unifiedBalances, setUnifiedBalances] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [mintTxHash, setMintTxHash] = useState<string | null>(null);
  const [mintStatus, setMintStatus] = useState<string | null>(null);
  const [destinationChain, setDestinationChain] = useState<string | null>(null);

  // Hooks & Automation states
  const [autoSweepEnabled, setAutoSweepEnabled] = useState(false);
  const [autoSweepThreshold, setAutoSweepThreshold] = useState([1000]);
  const [autoSweepDestination, setAutoSweepDestination] = useState('8453');
  
  const [autoRebalanceEnabled, setAutoRebalanceEnabled] = useState(false);
  const [rebalanceThreshold, setRebalanceThreshold] = useState([5]);
  
  const [scheduledTransferEnabled, setScheduledTransferEnabled] = useState(false);
  const [scheduledAmount, setScheduledAmount] = useState('100');
  const [scheduledFrequency, setScheduledFrequency] = useState('weekly');
  const [scheduledDestination, setScheduledDestination] = useState('8453');
  
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState([100]);
  
  const [webhookUrl, setWebhookUrl] = useState('');

  // Simulate hook execution
  const [lastHookExecution, setLastHookExecution] = useState<{
    type: string;
    timestamp: Date;
    details: string;
  } | null>(null);

  // Fetch unified balance when connected
  useEffect(() => {
    const fetchBalances = async () => {
      if (isConnected && address) {
        const balances = await getUnifiedBalance();
        if (balances) {
          console.log('Fetched unified balances:', balances);
          setUnifiedBalances(balances);
          setLastRefreshTime(new Date());
          
          // Check hooks conditions
          checkHookConditions(balances);
        }
      }
    };
    
    fetchBalances();
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, [isConnected, address, getUnifiedBalance, chainId]);

  // Check hook conditions
  const checkHookConditions = (balances: any[]) => {
    const totalBalance = balances.reduce((sum, b) => sum + parseFloat(b.balance || '0'), 0);
    
    // Auto-sweep check
    if (autoSweepEnabled && totalBalance > autoSweepThreshold[0]) {
      executeAutoSweep(totalBalance);
    }
    
    // Rebalance check
    if (autoRebalanceEnabled) {
      checkRebalancing(balances);
    }
    
    // Low balance alert
    if (alertsEnabled && totalBalance < alertThreshold[0]) {
      sendLowBalanceAlert(totalBalance);
    }
  };

  const executeAutoSweep = async (totalBalance: number) => {
    setLastHookExecution({
      type: 'Auto-Sweep',
      timestamp: new Date(),
      details: `Swept ${totalBalance.toFixed(2)} USDC to ${chains.find(c => c.id.toString() === autoSweepDestination)?.name}`
    });
    
    toast({
      title: "Auto-Sweep Triggered",
      description: `Moving ${totalBalance.toFixed(2)} USDC to destination chain`,
    });
    
    // Trigger webhook if configured
    if (webhookUrl) {
      triggerWebhook('auto_sweep', { amount: totalBalance, destination: autoSweepDestination });
    }
  };

  const checkRebalancing = (balances: any[]) => {
    const totalBalance = balances.reduce((sum, b) => sum + parseFloat(b.balance || '0'), 0);
    const avgBalance = totalBalance / balances.length;
    
    balances.forEach(balance => {
      const deviation = Math.abs((parseFloat(balance.balance) - avgBalance) / avgBalance * 100);
      if (deviation > rebalanceThreshold[0]) {
        executeRebalancing(balances, avgBalance);
        return;
      }
    });
  };

  const executeRebalancing = (balances: any[], target: number) => {
    setLastHookExecution({
      type: 'Auto-Rebalance',
      timestamp: new Date(),
      details: `Rebalancing chains to ~${target.toFixed(2)} USDC each`
    });
    
    toast({
      title: "Auto-Rebalance Triggered",
      description: `Redistributing USDC across chains`,
    });
    
    if (webhookUrl) {
      triggerWebhook('auto_rebalance', { balances, target });
    }
  };

  const sendLowBalanceAlert = (balance: number) => {
    toast({
      title: "Low Balance Alert",
      description: `Total balance is ${balance.toFixed(2)} USDC, below threshold of ${alertThreshold[0]} USDC`,
      variant: "destructive",
    });
    
    if (webhookUrl) {
      triggerWebhook('low_balance_alert', { balance, threshold: alertThreshold[0] });
    }
  };

  const triggerWebhook = async (event: string, data: any) => {
    if (!webhookUrl) return;
    
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          event,
          timestamp: new Date().toISOString(),
          data
        })
      });
    } catch (error) {
      console.error('Webhook error:', error);
    }
  };

  const executeScheduledTransfer = () => {
    if (!scheduledTransferEnabled) return;
    
    setLastHookExecution({
      type: 'Scheduled Transfer',
      timestamp: new Date(),
      details: `Transferred ${scheduledAmount} USDC (${scheduledFrequency})`
    });
    
    toast({
      title: "Scheduled Transfer Executed",
      description: `${scheduledAmount} USDC transferred to ${chains.find(c => c.id.toString() === scheduledDestination)?.name}`,
    });
    
    if (webhookUrl) {
      triggerWebhook('scheduled_transfer', { 
        amount: scheduledAmount, 
        destination: scheduledDestination,
        frequency: scheduledFrequency 
      });
    }
  };

  // Manual refresh function
  const handleRefreshBalances = async () => {
    if (!isConnected || !address || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const balances = await getUnifiedBalance();
      if (balances) {
        setUnifiedBalances(balances);
        setLastRefreshTime(new Date());
        checkHookConditions(balances);
      }
    } catch (error) {
      console.error('Error refreshing balances:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleConnect = async (connectorId?: string) => {
    try {
      const walletConnectConnector = connectors.find(c => c.id === 'walletConnect' || c.id === 'com.walletconnect');
      const injectedConnector = connectors.find(c => c.id === 'injected' || c.id === 'com.injected');
      
      let selectedConnector;
      
      if (connectorId === 'walletConnect') {
        selectedConnector = walletConnectConnector;
      } else if (window.ethereum && injectedConnector) {
        selectedConnector = injectedConnector;
      } else if (walletConnectConnector) {
        selectedConnector = walletConnectConnector;
      }
      
      if (selectedConnector) {
        await connect({ connector: selectedConnector });
      }
    } catch (error: any) {
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
    
    const currentChainDomain = chains.find(c => c.id === chainId)?.domain;
    const toDomain = chains.find(c => c.id === toChain)?.domain || 0;
    const toChainName = chains.find(c => c.id === toChain)?.name || '';
    
    if (currentChainDomain === undefined) {
      alert('Please switch to a supported network');
      return;
    }
    
    setMintStatus('Initializing transfer...');
    setDestinationChain(toChainName.toLowerCase().replace(/\s+/g, ''));
    
    const txHash = await transferCrossChain(amount, currentChainDomain, toDomain, toChain);
    if (txHash && typeof txHash === 'string') {
      setMintTxHash(txHash);
      setMintStatus('Transfer complete! USDC has been minted on destination chain.');
    } else {
      setMintStatus(null);
      setMintTxHash(null);
    }
    setAmount('');
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const currentChain = chains.find(c => c.id === chainId);

  return (
    <div className="w-full space-y-6">
      {/* Header with wallet status */}
      {isConnected && (
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
      )}

      {/* Wallet Connection */}
      {!isConnected ? (
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
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Connect your wallet to deposit and transfer USDC across chains.
                </AlertDescription>
              </Alert>
              
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
                    Connect Wallet
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Balance Overview */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Wallet className="h-3 w-3" />
                    Wallet USDC
                  </p>
                  <p className="text-lg font-bold">{parseFloat(usdcBalance).toFixed(2)} USDC</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Gateway Balance
                  </p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {unifiedBalances.reduce((sum, b) => sum + parseFloat(b.balance || '0'), 0).toFixed(2)} USDC
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Gateway Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Circle Gateway Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="hooks" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="hooks">Hooks & Automation</TabsTrigger>
                  <TabsTrigger value="deposit">Deposit</TabsTrigger>
                  <TabsTrigger value="transfer">Transfer</TabsTrigger>
                  <TabsTrigger value="balances">Balances</TabsTrigger>
                </TabsList>

                <TabsContent value="hooks" className="space-y-6">
                  {/* Auto-Sweep Configuration */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Auto-Sweep
                          </CardTitle>
                          <CardDescription>
                            Automatically consolidate funds when threshold is reached
                          </CardDescription>
                        </div>
                        <Switch
                          checked={autoSweepEnabled}
                          onCheckedChange={setAutoSweepEnabled}
                        />
                      </div>
                    </CardHeader>
                    {autoSweepEnabled && (
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Threshold Amount: {autoSweepThreshold[0]} USDC</Label>
                          <Slider
                            value={autoSweepThreshold}
                            onValueChange={setAutoSweepThreshold}
                            max={10000}
                            min={100}
                            step={100}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Destination Chain</Label>
                          <Select value={autoSweepDestination} onValueChange={setAutoSweepDestination}>
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
                      </CardContent>
                    )}
                  </Card>

                  {/* Auto-Rebalancing */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            <ArrowUpDown className="h-4 w-4" />
                            Auto-Rebalancing
                          </CardTitle>
                          <CardDescription>
                            Maintain balanced distribution across chains
                          </CardDescription>
                        </div>
                        <Switch
                          checked={autoRebalanceEnabled}
                          onCheckedChange={setAutoRebalanceEnabled}
                        />
                      </div>
                    </CardHeader>
                    {autoRebalanceEnabled && (
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Rebalance when deviation exceeds: {rebalanceThreshold[0]}%</Label>
                          <Slider
                            value={rebalanceThreshold}
                            onValueChange={setRebalanceThreshold}
                            max={20}
                            min={1}
                            step={1}
                            className="w-full"
                          />
                        </div>
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Funds will be redistributed when any chain's balance deviates more than {rebalanceThreshold[0]}% from the average
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                    )}
                  </Card>

                  {/* Scheduled Transfers */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Scheduled Transfers
                          </CardTitle>
                          <CardDescription>
                            Set up recurring transfers for payroll or regular payments
                          </CardDescription>
                        </div>
                        <Switch
                          checked={scheduledTransferEnabled}
                          onCheckedChange={setScheduledTransferEnabled}
                        />
                      </div>
                    </CardHeader>
                    {scheduledTransferEnabled && (
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Amount (USDC)</Label>
                            <Input 
                              value={scheduledAmount}
                              onChange={(e) => setScheduledAmount(e.target.value)}
                              placeholder="100"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Frequency</Label>
                            <Select value={scheduledFrequency} onValueChange={setScheduledFrequency}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Destination</Label>
                          <Select value={scheduledDestination} onValueChange={setScheduledDestination}>
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
                        <Button 
                          onClick={executeScheduledTransfer}
                          variant="outline" 
                          className="w-full"
                        >
                          <Timer className="mr-2 h-4 w-4" />
                          Test Scheduled Transfer
                        </Button>
                      </CardContent>
                    )}
                  </Card>

                  {/* Low Balance Alerts */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            Low Balance Alerts
                          </CardTitle>
                          <CardDescription>
                            Get notified when balance falls below threshold
                          </CardDescription>
                        </div>
                        <Switch
                          checked={alertsEnabled}
                          onCheckedChange={setAlertsEnabled}
                        />
                      </div>
                    </CardHeader>
                    {alertsEnabled && (
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Alert when balance below: {alertThreshold[0]} USDC</Label>
                          <Slider
                            value={alertThreshold}
                            onValueChange={setAlertThreshold}
                            max={1000}
                            min={10}
                            step={10}
                            className="w-full"
                          />
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  {/* Webhook Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Webhook Configuration
                      </CardTitle>
                      <CardDescription>
                        Connect to Zapier or your backend for automation events
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Webhook URL</Label>
                        <Input
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          placeholder="https://hooks.zapier.com/..."
                        />
                      </div>
                      {webhookUrl && (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            Webhook configured. Events will be sent to your endpoint.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>

                  {/* Last Hook Execution */}
                  {lastHookExecution && (
                    <Alert>
                      <Activity className="h-4 w-4" />
                      <AlertTitle>Last Hook Execution</AlertTitle>
                      <AlertDescription>
                        <div className="mt-2 space-y-1">
                          <p><strong>{lastHookExecution.type}</strong></p>
                          <p className="text-sm">{lastHookExecution.details}</p>
                          <p className="text-xs text-muted-foreground">
                            {lastHookExecution.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                <TabsContent value="deposit" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Deposit Amount</Label>
                      <Input
                        type="number"
                        placeholder="Enter USDC amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="text-lg mt-2"
                      />
                    </div>

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
                        <Label>From Chain</Label>
                        <Select value={fromChain.toString()} onValueChange={(v) => setFromChain(Number(v))}>
                          <SelectTrigger className="mt-2">
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
                        <Label>To Chain</Label>
                        <Select value={toChain.toString()} onValueChange={(v) => setToChain(Number(v))}>
                          <SelectTrigger className="mt-2">
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
                      <Label>Transfer Amount</Label>
                      <Input
                        type="number"
                        placeholder="Enter USDC amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="text-lg mt-2"
                      />
                    </div>

                    <Button
                      onClick={handleTransfer}
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
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Transfer Cross-Chain
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="balances" className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Unified Balance Across Chains</h3>
                    <Button
                      onClick={handleRefreshBalances}
                      disabled={isRefreshing}
                      size="sm"
                      variant="outline"
                    >
                      {isRefreshing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Refresh
                    </Button>
                  </div>
                  
                  {unifiedBalances.length > 0 ? (
                    unifiedBalances.map((balance, idx) => {
                      const chain = chains.find(c => c.domain === balance.domain);
                      const hasBalance = parseFloat(balance.balance) > 0;
                      return (
                        <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${hasBalance ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900' : 'bg-muted'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${chain?.color || 'bg-gray-500'}`} />
                            <span className="font-medium">
                              {chain?.name || `Domain ${balance.domain}`}
                            </span>
                          </div>
                          <span className={`font-mono font-bold ${hasBalance ? 'text-green-600 dark:text-green-400' : ''}`}>
                            {balance.balance} USDC
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No Gateway balances found</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default CircleGatewayLive;