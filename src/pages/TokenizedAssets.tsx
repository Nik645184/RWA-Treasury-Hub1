import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { RWAAssetCard } from '@/components/rwa/RWAAssetCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  mockRWAAssets, 
  formatValue,
  generateRWAPriceHistory,
  useRWAData
} from '@/utils/rwaApi';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Shield, 
  Activity,
  Info,
  ExternalLink,
  Globe
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TokenizedAssets = () => {
  const assets = useRWAData(mockRWAAssets);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Filter assets based on search
  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.issuer.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Generate price history for selected asset
  const priceHistory = generateRWAPriceHistory(30, selectedAsset.price, 0.5);
  const chartData = priceHistory.map((price, index) => ({
    day: index + 1,
    price
  }));

  return (
    <PageLayout title="Tokenized Assets Explorer">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
            {filteredAssets.map((asset) => (
              <Card
                key={asset.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedAsset.id === asset.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedAsset(asset)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{asset.symbol}</h3>
                        <Badge variant="outline" className="text-xs">
                          {asset.category.replace('-', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{asset.issuer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{asset.yield > 0 ? `${asset.yield.toFixed(2)}%` : '-'}</p>
                      <p className={`text-xs ${asset.changePercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                    <span>{formatValue(asset.aum)}</span>
                    <span>{asset.holders.toLocaleString()} holders</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Asset Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAsset && (
            <>
              {/* Asset Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{selectedAsset.symbol}</CardTitle>
                      <p className="text-muted-foreground">{selectedAsset.name}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge>{selectedAsset.category.replace('-', ' ').toUpperCase()}</Badge>
                        <span className="text-sm text-muted-foreground">
                          Issued by <span className="font-medium">{selectedAsset.issuer}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">
                        ${selectedAsset.price < 10 ? selectedAsset.price.toFixed(4) : selectedAsset.price.toFixed(2)}
                      </p>
                      <div className={`flex items-center justify-end gap-1 ${
                        selectedAsset.changePercent >= 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-medium">
                          {selectedAsset.changePercent >= 0 ? '+' : ''}{selectedAsset.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="compliance">Compliance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Activity className="h-4 w-4" />
                          <span>Yield</span>
                        </div>
                        <p className="text-2xl font-bold mt-1">
                          {selectedAsset.yield > 0 ? `${selectedAsset.yield.toFixed(2)}%` : 'N/A'}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Shield className="h-4 w-4" />
                          <span>Risk Score</span>
                        </div>
                        <p className="text-2xl font-bold mt-1">{selectedAsset.riskScore}/100</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Activity className="h-4 w-4" />
                          <span>Liquidity</span>
                        </div>
                        <p className="text-2xl font-bold mt-1">{selectedAsset.liquidityScore}/100</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Globe className="h-4 w-4" />
                          <span>Chains</span>
                        </div>
                        <p className="text-2xl font-bold mt-1">{selectedAsset.blockchain.length}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Asset Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Asset Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Assets Under Management</p>
                          <p className="font-medium">{formatValue(selectedAsset.aum)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Daily Volume</p>
                          <p className="font-medium">{formatValue(selectedAsset.dailyVolume)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Holders</p>
                          <p className="font-medium">{selectedAsset.holders.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Market Cap</p>
                          <p className="font-medium">{formatValue(selectedAsset.marketCap)}</p>
                        </div>
                        {selectedAsset.maturity && (
                          <div>
                            <p className="text-sm text-muted-foreground">Maturity</p>
                            <p className="font-medium">{selectedAsset.maturity}</p>
                          </div>
                        )}
                        {selectedAsset.collateralRatio && (
                          <div>
                            <p className="text-sm text-muted-foreground">Collateral Ratio</p>
                            <p className="font-medium">{selectedAsset.collateralRatio}%</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="performance">
                  <Card>
                    <CardHeader>
                      <CardTitle>30-Day Price History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="day" />
                            <YAxis domain={['auto', 'auto']} />
                            <Tooltip formatter={(value) => [`$${Number(value).toFixed(4)}`, 'Price']} />
                            <Line 
                              type="monotone" 
                              dataKey="price" 
                              stroke="hsl(var(--primary))" 
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Technical Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-sm text-muted-foreground">Token Standard</span>
                        <span className="font-medium">{selectedAsset.tokenStandard}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-sm text-muted-foreground">Blockchains</span>
                        <div className="flex gap-1">
                          {selectedAsset.blockchain.map((chain) => (
                            <Badge key={chain} variant="outline" className="text-xs">
                              {chain}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {selectedAsset.oracleProvider && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-sm text-muted-foreground">Oracle Provider</span>
                          <span className="font-medium">{selectedAsset.oracleProvider}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-muted-foreground">Last Audit</span>
                        <span className="font-medium">{selectedAsset.lastAudit}</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="compliance" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Compliance & Regulatory</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Compliance Frameworks</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedAsset.complianceFramework.map((framework) => (
                            <Badge key={framework} variant="secondary">
                              {framework}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="pt-3 border-t">
                        <Button variant="outline" className="w-full">
                          <Info className="h-4 w-4 mr-2" />
                          View Full Compliance Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default TokenizedAssets;