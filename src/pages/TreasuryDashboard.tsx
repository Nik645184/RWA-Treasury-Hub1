import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Activity, 
  Shield, 
  TrendingUp,
  Globe,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Lock
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

// USDC circulation data
const circulationData = [
  { date: 'Jan', total: 58.2, minted: 12.3, burned: 8.1 },
  { date: 'Feb', total: 59.5, minted: 14.2, burned: 9.8 },
  { date: 'Mar', total: 61.2, minted: 16.5, burned: 11.2 },
  { date: 'Apr', total: 62.8, minted: 15.8, burned: 10.3 },
  { date: 'May', total: 64.1, minted: 17.2, burned: 12.1 },
  { date: 'Jun', total: 65.2, minted: 18.5, burned: 13.2 }
];

// Chain distribution
const chainDistribution = [
  { name: 'Ethereum', value: 23.5, color: 'hsl(210, 100%, 50%)' },
  { name: 'Arbitrum', value: 12.3, color: 'hsl(30, 100%, 50%)' },
  { name: 'Base', value: 10.0, color: 'hsl(200, 100%, 50%)' },
  { name: 'Avalanche', value: 8.0, color: 'hsl(0, 100%, 50%)' },
  { name: 'OP Mainnet', value: 5.0, color: 'hsl(350, 100%, 50%)' },
  { name: 'Polygon', value: 4.0, color: 'hsl(270, 100%, 50%)' },
  { name: 'Unichain', value: 2.4, color: 'hsl(330, 100%, 50%)' }
];

// Recent Gateway transfers
const recentTransfers = [
  { id: 1, from: 'Ethereum', to: 'Arbitrum', amount: 5000000, status: 'completed', time: '2 min ago', txHash: '0x1234...5678' },
  { id: 2, from: 'Base', to: 'Polygon', amount: 2500000, status: 'completed', time: '5 min ago', txHash: '0x2345...6789' },
  { id: 3, from: 'Avalanche', to: 'Ethereum', amount: 8000000, status: 'pending', time: '8 min ago', txHash: '0x3456...7890' },
  { id: 4, from: 'OP Mainnet', to: 'Base', amount: 3200000, status: 'completed', time: '12 min ago', txHash: '0x4567...8901' },
  { id: 5, from: 'Polygon', to: 'Arbitrum', amount: 1500000, status: 'completed', time: '15 min ago', txHash: '0x5678...9012' }
];

// Treasury positions
const treasuryPositions = [
  { protocol: 'Aave V3', chain: 'Ethereum', type: 'Lending', amount: 12500000, apy: 4.2, risk: 'Low' },
  { protocol: 'Compound', chain: 'Arbitrum', type: 'Lending', amount: 8300000, apy: 5.8, risk: 'Low' },
  { protocol: 'Curve', chain: 'Base', type: 'LP', amount: 6200000, apy: 8.2, risk: 'Medium' },
  { protocol: 'GMX', chain: 'Avalanche', type: 'Staking', amount: 4100000, apy: 12.5, risk: 'High' },
  { protocol: 'Uniswap V3', chain: 'OP Mainnet', type: 'LP', amount: 3500000, apy: 9.8, risk: 'Medium' }
];

const TreasuryDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const totalUSDC = 65.2; // in millions
  const totalReserves = totalUSDC * 1000; // Convert to actual amount for display
  
  return (
    <PageLayout title="USDC Treasury Command Center">
      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total USDC Supply
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalUSDC}B</div>
            <div className="flex items-center gap-1 mt-1 text-success">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs">+1.8% (7d)</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Treasury Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$65.2M</div>
            <Badge variant="outline" className="mt-1 text-xs">
              <Globe className="h-3 w-3 mr-1" />
              7 Chains
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              24h Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.8B</div>
            <div className="flex items-center gap-1 mt-1">
              <Zap className="h-3 w-3 text-primary" />
              <span className="text-xs">18,432 transfers</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Transfer Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">427ms</div>
            <Badge className="mt-1 text-xs" variant="default">
              <CheckCircle className="h-3 w-3 mr-1" />
              CCTP V2
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Collateral Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <div className="flex items-center gap-1 mt-1">
              <Shield className="h-3 w-3 text-success" />
              <span className="text-xs">Fully backed</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gateway">Circle Gateway</TabsTrigger>
          <TabsTrigger value="positions">DeFi Positions</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* USDC Circulation Chart */}
            <Card>
              <CardHeader>
                <CardTitle>USDC Circulation Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={circulationData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Total Supply (B)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="minted" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={2}
                      name="Minted (B)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="burned" 
                      stroke="hsl(var(--destructive))" 
                      strokeWidth={2}
                      name="Burned (B)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Chain Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Treasury Distribution by Chain</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chainDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: $${entry.value}M`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chainDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="gateway" className="space-y-6">
          {/* Gateway Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Gateway Transfers</CardTitle>
                    <Badge variant="default">
                      <Activity className="h-3 w-3 mr-1" />
                      Live
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentTransfers.map((transfer) => (
                      <div key={transfer.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{transfer.from}</Badge>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="outline">{transfer.to}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-medium">${(transfer.amount / 1000000).toFixed(1)}M</p>
                            <p className="text-xs text-muted-foreground">{transfer.time}</p>
                          </div>
                          {transfer.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-success" />
                          ) : (
                            <Clock className="h-4 w-4 text-warning animate-pulse" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-4">
              {/* Gateway Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Gateway Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">99.98%</span>
                      <CheckCircle className="h-4 w-4 text-success" />
                    </div>
                  </div>
                  <Progress value={99.98} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg Gas Saved</span>
                    <span className="font-medium text-success">-82%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Hooks</span>
                    <Badge>12 Active</Badge>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Gateway Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Initiate Transfer
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Activity className="h-4 w-4 mr-2" />
                    Configure Hooks
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Compliance Check
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="positions" className="space-y-6">
          {/* DeFi Positions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active DeFi Positions</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    Total: ${treasuryPositions.reduce((sum, p) => sum + p.amount, 0) / 1000000}M
                  </Badge>
                  <Badge variant="outline">
                    Avg APY: {(treasuryPositions.reduce((sum, p) => sum + p.apy, 0) / treasuryPositions.length).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {treasuryPositions.map((position, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{position.protocol}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{position.chain}</Badge>
                          <Badge variant="outline" className="text-xs">{position.type}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-medium">${(position.amount / 1000000).toFixed(1)}M</p>
                        <p className="text-xs text-muted-foreground">{position.apy}% APY</p>
                      </div>
                      <Badge 
                        variant={position.risk === 'Low' ? 'default' : position.risk === 'Medium' ? 'secondary' : 'destructive'}
                      >
                        {position.risk}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="compliance" className="space-y-6">
          {/* Compliance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">KYC/AML Coverage</span>
                    <span className="font-medium">95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">MiCA Compliance</span>
                    <CheckCircle className="h-4 w-4 text-success" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SEC Registration</span>
                    <CheckCircle className="h-4 w-4 text-success" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Chainlink PoR</span>
                    <Badge variant="default">Verified</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Reserve Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Circle Reserve Fund', value: 85, fill: 'hsl(var(--primary))' },
                        { name: 'Cash Deposits', value: 15, fill: 'hsl(var(--secondary))' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Reserve Fund</p>
                    <p className="font-medium">$55.4B (85%)</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cash</p>
                    <p className="font-medium">$9.8B (15%)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default TreasuryDashboard;