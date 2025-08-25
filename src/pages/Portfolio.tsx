
import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { RWAAssetCard } from '@/components/rwa/RWAAssetCard';
import { AssetAllocationChart } from '@/components/rwa/AssetAllocationChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  mockRWAAssets, 
  formatValue, 
  calculatePortfolioMetrics,
  useRWAData,
  getAssetsByCategory
} from '@/utils/rwaApi';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Activity,
  Layers,
  PlusCircle,
  Settings,
  Download
} from 'lucide-react';

const Portfolio = () => {
  const assets = useRWAData(mockRWAAssets);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Filter assets based on selected category
  const filteredAssets = selectedCategory === 'all' 
    ? assets 
    : assets.filter(a => a.category === selectedCategory);
  
  // Calculate portfolio metrics
  const metrics = calculatePortfolioMetrics(filteredAssets);
  
  // Calculate allocation by category
  const allocationData = [
    { name: 'Treasuries', value: getAssetsByCategory('treasury').reduce((sum, a) => sum + a.aum, 0) },
    { name: 'Private Credit', value: getAssetsByCategory('private-credit').reduce((sum, a) => sum + a.aum, 0) },
    { name: 'Real Estate', value: getAssetsByCategory('real-estate').reduce((sum, a) => sum + a.aum, 0) },
    { name: 'Commodities', value: getAssetsByCategory('commodity').reduce((sum, a) => sum + a.aum, 0) }
  ];
  
  // Top performing assets
  const topPerformers = [...assets].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
  const topYieldAssets = [...assets].filter(a => a.yield > 0).sort((a, b) => b.yield - a.yield).slice(0, 3);

  return (
    <PageLayout title="RWA Portfolio Management">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatValue(metrics.totalValue)}</div>
            <div className="flex items-center gap-1 mt-1 text-success">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs">+12.5% this month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Yield
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgYield.toFixed(2)}%</div>
            <div className="text-xs text-muted-foreground mt-1">Annual percentage yield</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{metrics.avgRisk.toFixed(0)}/100</div>
              <Shield className={`h-4 w-4 ${metrics.avgRisk < 40 ? 'text-success' : metrics.avgRisk < 60 ? 'text-warning' : 'text-destructive'}`} />
            </div>
            <Progress value={metrics.avgRisk} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Diversification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{metrics.diversificationScore.toFixed(0)}%</div>
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">Portfolio health score</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Portfolio Holdings</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Asset
              </Button>
            </div>
          </div>
          
          {/* Category Filters */}
          <div className="flex gap-2 flex-wrap">
            <Badge 
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory('all')}
            >
              All Assets ({assets.length})
            </Badge>
            <Badge 
              variant={selectedCategory === 'treasury' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory('treasury')}
            >
              Treasuries ({getAssetsByCategory('treasury').length})
            </Badge>
            <Badge 
              variant={selectedCategory === 'private-credit' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory('private-credit')}
            >
              Private Credit ({getAssetsByCategory('private-credit').length})
            </Badge>
            <Badge 
              variant={selectedCategory === 'real-estate' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory('real-estate')}
            >
              Real Estate ({getAssetsByCategory('real-estate').length})
            </Badge>
            <Badge 
              variant={selectedCategory === 'commodity' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory('commodity')}
            >
              Commodities ({getAssetsByCategory('commodity').length})
            </Badge>
          </div>
          
          {/* Asset Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssets.map((asset) => (
              <RWAAssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Allocation Chart */}
          <AssetAllocationChart 
            data={allocationData}
            title="Asset Allocation"
          />
          
          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Performers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topPerformers.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{asset.symbol}</p>
                    <p className="text-xs text-muted-foreground">{asset.issuer}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-success">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-sm font-medium">
                        +{asset.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* High Yield Assets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Highest Yields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topYieldAssets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{asset.symbol}</p>
                    <p className="text-xs text-muted-foreground">{asset.category.replace('-', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{asset.yield.toFixed(2)}%</p>
                    <p className="text-xs text-muted-foreground">APY</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Activity className="h-4 w-4 mr-2" />
                Rebalance Portfolio
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Risk Assessment
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Portfolio Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Portfolio;
