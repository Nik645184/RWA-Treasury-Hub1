import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  getAssetsByCategory,
  formatValue,
  mockRWAAssets
} from '@/utils/rwaApi';
import { 
  TrendingUp, 
  TrendingDown,
  Building,
  CreditCard,
  Home,
  Coins,
  Globe,
  Shield,
  Activity,
  Users,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

const RWAMarkets = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Market data by category
  const treasuryAssets = getAssetsByCategory('treasury');
  const creditAssets = getAssetsByCategory('private-credit');
  const realEstateAssets = getAssetsByCategory('real-estate');
  const commodityAssets = getAssetsByCategory('commodity');
  
  // Calculate market metrics
  const calculateCategoryMetrics = (assets: typeof mockRWAAssets) => {
    const totalAUM = assets.reduce((sum, a) => sum + a.aum, 0);
    const avgYield = assets.length > 0 
      ? assets.reduce((sum, a) => sum + a.yield, 0) / assets.length 
      : 0;
    const totalHolders = assets.reduce((sum, a) => sum + a.holders, 0);
    const totalVolume = assets.reduce((sum, a) => sum + a.dailyVolume, 0);
    const avgRisk = assets.length > 0
      ? assets.reduce((sum, a) => sum + a.riskScore, 0) / assets.length
      : 0;
    
    return { totalAUM, avgYield, totalHolders, totalVolume, avgRisk };
  };
  
  const treasuryMetrics = calculateCategoryMetrics(treasuryAssets);
  const creditMetrics = calculateCategoryMetrics(creditAssets);
  const realEstateMetrics = calculateCategoryMetrics(realEstateAssets);
  const commodityMetrics = calculateCategoryMetrics(commodityAssets);
  
  // Market share data for pie chart
  const marketShareData = [
    { name: 'Treasuries', value: treasuryMetrics.totalAUM, color: '#3b82f6' },
    { name: 'Private Credit', value: creditMetrics.totalAUM, color: '#8b5cf6' },
    { name: 'Real Estate', value: realEstateMetrics.totalAUM, color: '#10b981' },
    { name: 'Commodities', value: commodityMetrics.totalAUM, color: '#f59e0b' }
  ];
  
  // Mock historical data for growth chart
  const growthData = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    treasuries: 1500 + (i * 300) + Math.random() * 200,
    credit: 800 + (i * 250) + Math.random() * 150,
    realEstate: 100 + (i * 15) + Math.random() * 20,
    commodities: 400 + (i * 40) + Math.random() * 50
  }));

  const categoryCards = [
    {
      title: 'Treasuries',
      icon: <Building className="h-5 w-5" />,
      metrics: treasuryMetrics,
      assets: treasuryAssets,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      category: 'treasury'
    },
    {
      title: 'Private Credit',
      icon: <CreditCard className="h-5 w-5" />,
      metrics: creditMetrics,
      assets: creditAssets,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      category: 'private-credit'
    },
    {
      title: 'Real Estate',
      icon: <Home className="h-5 w-5" />,
      metrics: realEstateMetrics,
      assets: realEstateAssets,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      category: 'real-estate'
    },
    {
      title: 'Commodities',
      icon: <Coins className="h-5 w-5" />,
      metrics: commodityMetrics,
      assets: commodityAssets,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      category: 'commodity'
    }
  ];

  return (
    <PageLayout title="RWA Markets Overview">
      {/* Market Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {categoryCards.map((card) => (
          <Card 
            key={card.title}
            className="cursor-pointer transition-all hover:shadow-lg"
            onClick={() => setSelectedCategory(card.category)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <div className={card.color}>{card.icon}</div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {card.assets.length} Assets
                </Badge>
              </div>
              <CardTitle className="text-base mt-2">{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-2xl font-bold">{formatValue(card.metrics.totalAUM)}</p>
                <p className="text-xs text-muted-foreground">Total Market Cap</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Avg Yield</p>
                  <p className="font-medium">{card.metrics.avgYield.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">24h Vol</p>
                  <p className="font-medium">{formatValue(card.metrics.totalVolume)}</p>
                </div>
              </div>
              <Progress value={card.metrics.avgRisk} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                Risk Score: {card.metrics.avgRisk.toFixed(0)}/100
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Market Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Share */}
        <Card>
          <CardHeader>
            <CardTitle>Market Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={marketShareData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {marketShareData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatValue(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {marketShareData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">
                    {((item.value / marketShareData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Growth Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Market Growth (2024)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatValue(Number(value) * 1000000)} />
                  <Area 
                    type="monotone" 
                    dataKey="treasuries" 
                    stackId="1"
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="credit" 
                    stackId="1"
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="realEstate" 
                    stackId="1"
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="commodities" 
                    stackId="1"
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Leaders */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Market Leaders by Category</CardTitle>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="treasury">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="treasury">Treasuries</TabsTrigger>
              <TabsTrigger value="credit">Credit</TabsTrigger>
              <TabsTrigger value="real-estate">Real Estate</TabsTrigger>
              <TabsTrigger value="commodity">Commodities</TabsTrigger>
            </TabsList>
            
            {['treasury', 'private-credit', 'real-estate', 'commodity'].map((category) => (
              <TabsContent key={category} value={category === 'private-credit' ? 'credit' : category}>
                <div className="space-y-3">
                  {getAssetsByCategory(category).slice(0, 3).map((asset, index) => (
                    <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-bold text-muted-foreground">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{asset.symbol}</span>
                            <Badge variant="outline" className="text-xs">
                              {asset.issuer}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{asset.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatValue(asset.aum)}</p>
                        <div className={`flex items-center justify-end gap-1 text-sm ${
                          asset.changePercent >= 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {asset.changePercent >= 0 ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          <span>{Math.abs(asset.changePercent).toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default RWAMarkets;