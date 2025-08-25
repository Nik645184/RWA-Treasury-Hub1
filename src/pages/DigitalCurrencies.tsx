import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Shield,
  Activity,
  Globe,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowRight,
  Coins
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Stablecoin {
  id: string;
  symbol: string;
  name: string;
  issuer: string;
  marketCap: number;
  price: number;
  volume24h: number;
  collateralizationType: 'fiat' | 'crypto' | 'algorithmic' | 'rwa';
  collateralRatio: number;
  blockchain: string[];
  regulatory: string[];
  audited: boolean;
  changePercent: number;
  pegDeviation: number;
}

const mockStablecoins: Stablecoin[] = [
  {
    id: '1',
    symbol: 'USDT',
    name: 'Tether',
    issuer: 'Tether Limited',
    marketCap: 95000000000,
    price: 1.0001,
    volume24h: 45000000000,
    collateralizationType: 'fiat',
    collateralRatio: 100.5,
    blockchain: ['Ethereum', 'Tron', 'BSC', 'Solana', 'Avalanche'],
    regulatory: ['BVI Registered'],
    audited: true,
    changePercent: 0.01,
    pegDeviation: 0.01
  },
  {
    id: '2',
    symbol: 'USDC',
    name: 'USD Coin',
    issuer: 'Circle',
    marketCap: 25000000000,
    price: 0.9999,
    volume24h: 8000000000,
    collateralizationType: 'fiat',
    collateralRatio: 100,
    blockchain: ['Ethereum', 'Solana', 'Avalanche', 'Polygon'],
    regulatory: ['US Licensed', 'MiCA Compliant'],
    audited: true,
    changePercent: -0.01,
    pegDeviation: -0.01
  },
  {
    id: '3',
    symbol: 'PYUSD',
    name: 'PayPal USD',
    issuer: 'PayPal',
    marketCap: 450000000,
    price: 1.0002,
    volume24h: 85000000,
    collateralizationType: 'fiat',
    collateralRatio: 100,
    blockchain: ['Ethereum', 'Solana'],
    regulatory: ['NYDFS Regulated'],
    audited: true,
    changePercent: 0.02,
    pegDeviation: 0.02
  },
  {
    id: '4',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    issuer: 'MakerDAO',
    marketCap: 5200000000,
    price: 0.9998,
    volume24h: 250000000,
    collateralizationType: 'crypto',
    collateralRatio: 152,
    blockchain: ['Ethereum', 'Polygon', 'Optimism'],
    regulatory: ['DeFi Protocol'],
    audited: true,
    changePercent: -0.02,
    pegDeviation: -0.02
  },
  {
    id: '5',
    symbol: 'FRAX',
    name: 'Frax',
    issuer: 'Frax Finance',
    marketCap: 650000000,
    price: 0.9997,
    volume24h: 45000000,
    collateralizationType: 'algorithmic',
    collateralRatio: 93,
    blockchain: ['Ethereum', 'Avalanche'],
    regulatory: ['DeFi Protocol'],
    audited: true,
    changePercent: -0.03,
    pegDeviation: -0.03
  },
  {
    id: '6',
    symbol: 'USDY',
    name: 'Ondo US Dollar Yield',
    issuer: 'Ondo Finance',
    marketCap: 350000000,
    price: 1.0542,
    volume24h: 12000000,
    collateralizationType: 'rwa',
    collateralRatio: 105,
    blockchain: ['Ethereum', 'Polygon'],
    regulatory: ['SEC Registered'],
    audited: true,
    changePercent: 0.15,
    pegDeviation: 5.42
  }
];

const DigitalCurrencies = () => {
  const [selectedStablecoin, setSelectedStablecoin] = useState(mockStablecoins[0]);
  
  // Calculate total metrics
  const totalMarketCap = mockStablecoins.reduce((sum, s) => sum + s.marketCap, 0);
  const totalVolume = mockStablecoins.reduce((sum, s) => sum + s.volume24h, 0);
  const avgCollateralRatio = mockStablecoins.reduce((sum, s) => sum + s.collateralRatio, 0) / mockStablecoins.length;
  
  // Group by type
  const groupByType = mockStablecoins.reduce((acc, stable) => {
    if (!acc[stable.collateralizationType]) {
      acc[stable.collateralizationType] = [];
    }
    acc[stable.collateralizationType].push(stable);
    return acc;
  }, {} as Record<string, Stablecoin[]>);
  
  // Mock price stability data
  const stabilityData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    usdt: 1 + (Math.random() - 0.5) * 0.002,
    usdc: 1 + (Math.random() - 0.5) * 0.002,
    dai: 1 + (Math.random() - 0.5) * 0.004,
    pyusd: 1 + (Math.random() - 0.5) * 0.001
  }));
  
  // Volume distribution
  const volumeData = mockStablecoins.map(s => ({
    name: s.symbol,
    volume: s.volume24h / 1000000000 // Convert to billions
  }));

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fiat': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'crypto': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'algorithmic': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'rwa': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getPegStatus = (deviation: number) => {
    const absDeviation = Math.abs(deviation);
    if (absDeviation < 0.1) return { status: 'stable', color: 'text-success', icon: <CheckCircle className="h-4 w-4" /> };
    if (absDeviation < 0.5) return { status: 'warning', color: 'text-warning', icon: <AlertCircle className="h-4 w-4" /> };
    return { status: 'volatile', color: 'text-destructive', icon: <AlertCircle className="h-4 w-4" /> };
  };

  return (
    <PageLayout title="Digital Currencies & Stablecoins">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Market Cap</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${(totalMarketCap / 1e9).toFixed(2)}B</p>
            <div className="flex items-center gap-1 mt-1 text-success">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs">+2.3% this week</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">24h Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${(totalVolume / 1e9).toFixed(2)}B</p>
            <p className="text-xs text-muted-foreground mt-1">Across all chains</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Avg Collateral Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{avgCollateralRatio.toFixed(1)}%</p>
            <Progress value={Math.min(avgCollateralRatio, 100)} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Stablecoins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockStablecoins.length}</p>
            <div className="flex gap-1 mt-2">
              {Object.keys(groupByType).map((type) => (
                <Badge key={type} variant="outline" className="text-xs">
                  {groupByType[type].length} {type}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stablecoin List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Stablecoin Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockStablecoins.map((stable) => {
                  const pegStatus = getPegStatus(stable.pegDeviation);
                  return (
                    <div
                      key={stable.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedStablecoin.id === stable.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedStablecoin(stable)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{stable.symbol}</h3>
                                <Badge className={getTypeColor(stable.collateralizationType)}>
                                  {stable.collateralizationType.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{stable.name}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm">
                            <div>
                              <span className="text-muted-foreground">Market Cap: </span>
                              <span className="font-medium">${(stable.marketCap / 1e9).toFixed(2)}B</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">24h Vol: </span>
                              <span className="font-medium">${(stable.volume24h / 1e9).toFixed(2)}B</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Collateral: </span>
                              <span className="font-medium">{stable.collateralRatio}%</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex gap-1">
                              {stable.blockchain.slice(0, 3).map((chain) => (
                                <Badge key={chain} variant="outline" className="text-xs">
                                  {chain}
                                </Badge>
                              ))}
                              {stable.blockchain.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{stable.blockchain.length - 3}
                                </Badge>
                              )}
                            </div>
                            {stable.audited && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Audited
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-2xl font-bold">${stable.price.toFixed(4)}</p>
                          <div className={`flex items-center justify-end gap-1 ${pegStatus.color}`}>
                            {pegStatus.icon}
                            <span className="text-sm">
                              {stable.pegDeviation >= 0 ? '+' : ''}{stable.pegDeviation.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Price Stability Chart */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>30-Day Price Stability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stabilityData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0.996, 1.004]} />
                    <Tooltip formatter={(value) => `$${Number(value).toFixed(4)}`} />
                    <Line type="monotone" dataKey="usdt" stroke="#3b82f6" strokeWidth={2} dot={false} name="USDT" />
                    <Line type="monotone" dataKey="usdc" stroke="#8b5cf6" strokeWidth={2} dot={false} name="USDC" />
                    <Line type="monotone" dataKey="dai" stroke="#10b981" strokeWidth={2} dot={false} name="DAI" />
                    <Line type="monotone" dataKey="pyusd" stroke="#f59e0b" strokeWidth={2} dot={false} name="PYUSD" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Stablecoin Details */}
          {selectedStablecoin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {selectedStablecoin.symbol} Details
                  <Badge className={getTypeColor(selectedStablecoin.collateralizationType)}>
                    {selectedStablecoin.collateralizationType}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Issuer</span>
                    <span className="font-medium">{selectedStablecoin.issuer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Collateral Ratio</span>
                    <span className="font-medium">{selectedStablecoin.collateralRatio}%</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Regulatory</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedStablecoin.regulatory.map((reg) => (
                        <Badge key={reg} variant="secondary" className="text-xs">
                          {reg}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Available on</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedStablecoin.blockchain.map((chain) => (
                        <Badge key={chain} variant="outline" className="text-xs">
                          {chain}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <Button className="w-full" variant="outline">
                  <Info className="h-4 w-4 mr-2" />
                  View Full Report
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Volume Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Volume Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}B`} />
                    <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Issue Stablecoin
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Compliance Check
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Liquidity Analysis
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default DigitalCurrencies;