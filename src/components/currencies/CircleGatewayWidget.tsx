import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, Shield, Zap, AlertCircle, CheckCircle2, RefreshCw, TrendingUp } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const chains = [
  { id: 'ethereum', name: 'Ethereum', balance: 23500000, color: '#627EEA' },
  { id: 'arbitrum', name: 'Arbitrum', balance: 12300000, color: '#28A0F0' },
  { id: 'avalanche', name: 'Avalanche', balance: 8900000, color: '#E84142' },
  { id: 'polygon', name: 'Polygon PoS', balance: 7200000, color: '#8247E5' },
  { id: 'base', name: 'Base', balance: 6100000, color: '#0052FF' },
  { id: 'optimism', name: 'OP Mainnet', balance: 4800000, color: '#FF0420' },
  { id: 'unichain', name: 'Unichain', balance: 2400000, color: '#FF007A' }
];

const reservesData = [
  { name: 'Circle Reserve Fund', value: 85, color: '#3B82F6' },
  { name: 'Cash & Equivalents', value: 15, color: '#10B981' }
];

const circulationTrend = [
  { date: 'Jul 1', value: 62.8 },
  { date: 'Jul 8', value: 63.2 },
  { date: 'Jul 15', value: 63.9 },
  { date: 'Jul 22', value: 64.5 },
  { date: 'Jul 29', value: 64.8 },
  { date: 'Aug 5', value: 65.0 },
  { date: 'Aug 12', value: 65.1 },
  { date: 'Aug 19', value: 65.2 }
];

const recentTransfers = [
  { id: 1, from: 'Ethereum', to: 'Arbitrum', amount: 500000, time: '2 min ago', status: 'completed' },
  { id: 2, from: 'Polygon', to: 'Base', amount: 250000, time: '5 min ago', status: 'completed' },
  { id: 3, from: 'Avalanche', to: 'Optimism', amount: 180000, time: '12 min ago', status: 'completed' },
  { id: 4, from: 'Base', to: 'Ethereum', amount: 1200000, time: '18 min ago', status: 'pending' }
];

export const CircleGatewayWidget = () => {
  const [selectedFromChain, setSelectedFromChain] = useState('ethereum');
  const [selectedToChain, setSelectedToChain] = useState('arbitrum');
  const [transferAmount, setTransferAmount] = useState('1000');
  const [isTransferring, setIsTransferring] = useState(false);
  const [autoRebalance, setAutoRebalance] = useState(true);

  const totalBalance = chains.reduce((sum, chain) => sum + chain.balance, 0);

  const handleTransfer = () => {
    setIsTransferring(true);
    setTimeout(() => {
      setIsTransferring(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total USDC Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalBalance / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">Across 7 chains</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Circulation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$65.2B</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +3.8% (30d)
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transfer Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <Zap className="h-5 w-5 mr-1 text-yellow-500" />
              &lt;500ms
            </div>
            <p className="text-xs text-muted-foreground">CCTP V2 Fast</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <Shield className="h-5 w-5 mr-1 text-green-500" />
              95%
            </div>
            <p className="text-xs text-muted-foreground">KYC/AML verified</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Gateway Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Circle Gateway Control Center
            <Badge variant="outline" className="ml-2">CCTP V2</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="transfer" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="transfer">Fast Transfer</TabsTrigger>
              <TabsTrigger value="balance">Balance Overview</TabsTrigger>
              <TabsTrigger value="automation">Hooks & Automation</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

            <TabsContent value="transfer" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>From Chain</Label>
                    <Select value={selectedFromChain} onValueChange={setSelectedFromChain}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {chains.map(chain => (
                          <SelectItem key={chain.id} value={chain.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{chain.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                ${(chain.balance / 1000000).toFixed(1)}M
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Amount (USDC)</Label>
                    <Input 
                      type="number" 
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>To Chain</Label>
                    <Select value={selectedToChain} onValueChange={setSelectedToChain}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {chains.filter(c => c.id !== selectedFromChain).map(chain => (
                          <SelectItem key={chain.id} value={chain.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{chain.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                ${(chain.balance / 1000000).toFixed(1)}M
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Estimated Time</div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">&lt; 500ms</span>
                      <Badge variant="secondary" className="text-xs">Next Block</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleTransfer} 
                disabled={isTransferring}
                className="w-full"
                size="lg"
              >
                {isTransferring ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing Transfer...
                  </>
                ) : (
                  <>
                    Execute Fast Transfer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {/* Recent Transfers */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-3">Recent Transfers</h3>
                <div className="space-y-2">
                  {recentTransfers.map(transfer => (
                    <div key={transfer.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{transfer.from}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">{transfer.to}</span>
                        </div>
                        <Badge variant={transfer.status === 'completed' ? 'default' : 'secondary'}>
                          {transfer.status === 'completed' ? (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          ) : (
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          )}
                          {transfer.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">${(transfer.amount / 1000).toFixed(0)}K</div>
                        <div className="text-xs text-muted-foreground">{transfer.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="balance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Chain Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={chains}
                          dataKey="balance"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        >
                          {chains.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `$${(value / 1000000).toFixed(2)}M`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">USDC Reserves Composition</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={reservesData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {reservesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">USDC Circulation Trend (30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={circulationTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `$${value}B`} />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="automation" className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  CCTP V2 Hooks enable automated treasury operations based on predefined rules and thresholds.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Auto-Rebalancing Rules</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Threshold Rebalancing</div>
                        <div className="text-sm text-muted-foreground">
                          Automatically rebalance when any chain exceeds 25% of total balance
                        </div>
                      </div>
                      <Button variant={autoRebalance ? "default" : "outline"} size="sm">
                        {autoRebalance ? "Active" : "Inactive"}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">DeFi Yield Optimization</div>
                        <div className="text-sm text-muted-foreground">
                          Move USDC to chains with highest Aave/Compound yields
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Low Balance Alert</div>
                        <div className="text-sm text-muted-foreground">
                          Alert when any chain balance falls below $1M
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">KYC/AML Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Identity Verification</span>
                        <Badge variant="default">Verified</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">AML Screening</span>
                        <Badge variant="default">Passed</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Source of Funds</span>
                        <Badge variant="default">Verified</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Last Audit</span>
                        <span className="text-sm text-muted-foreground">Aug 15, 2025</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Regulatory Compliance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">SEC Registration</span>
                        <Badge variant="default">Compliant</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">MiCA Compliance</span>
                        <Badge variant="default">75%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Chainlink PoR</span>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Reserve Attestation</span>
                        <span className="text-sm text-muted-foreground">Monthly</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Export Compliance Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Export PDF</Button>
                    <Button variant="outline" size="sm">Export CSV</Button>
                    <Button variant="outline" size="sm">Generate Tax Forms</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};