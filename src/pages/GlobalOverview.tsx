import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, 
  TrendingUp, 
  Users, 
  Building,
  Activity,
  Shield,
  Zap,
  Database,
  Link,
  Map
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

const GlobalOverview = () => {
  // Global RWA ecosystem data
  const ecosystemMetrics = {
    totalMarketSize: 25120000000, // $25.12B
    yearlyGrowth: 85,
    totalIssuers: 256,
    totalHolders: 335000,
    activeJurisdictions: 42,
    regulatedAssets: 78,
    defiIntegrations: 156,
    crossChainTransfers: 8923
  };
  
  // Regional distribution
  const regionalData = [
    { region: 'North America', value: 12500, percentage: 49.8, growth: 92 },
    { region: 'Europe', value: 6200, percentage: 24.7, growth: 78 },
    { region: 'Asia Pacific', value: 4800, percentage: 19.1, growth: 125 },
    { region: 'Middle East', value: 850, percentage: 3.4, growth: 156 },
    { region: 'Latin America', value: 520, percentage: 2.1, growth: 203 },
    { region: 'Africa', value: 250, percentage: 1.0, growth: 312 }
  ];
  
  // Blockchain distribution
  const blockchainData = [
    { name: 'Ethereum', value: 54.8, tvl: 13760 },
    { name: 'Polygon', value: 12.3, tvl: 3090 },
    { name: 'Avalanche', value: 8.7, tvl: 2186 },
    { name: 'Solana', value: 7.2, tvl: 1809 },
    { name: 'Base', value: 5.4, tvl: 1357 },
    { name: 'Others', value: 11.6, tvl: 2918 }
  ];
  
  // Regulatory frameworks
  const regulatoryFrameworks = [
    { framework: 'SEC (USA)', assets: 45, status: 'active' },
    { framework: 'MiCA (EU)', assets: 38, status: 'active' },
    { framework: 'FCA (UK)', assets: 22, status: 'active' },
    { framework: 'MAS (Singapore)', assets: 31, status: 'active' },
    { framework: 'DFSA (Dubai)', assets: 18, status: 'active' },
    { framework: 'FSA (Japan)', assets: 12, status: 'pending' }
  ];
  
  // Adoption metrics
  const adoptionData = [
    { month: 'Jan', institutional: 145, retail: 89, defi: 234 },
    { month: 'Feb', institutional: 168, retail: 95, defi: 256 },
    { month: 'Mar', institutional: 192, retail: 103, defi: 289 },
    { month: 'Apr', institutional: 218, retail: 118, defi: 312 },
    { month: 'May', institutional: 245, retail: 132, defi: 345 },
    { month: 'Jun', institutional: 278, retail: 148, defi: 389 }
  ];

  return (
    <PageLayout title="Global RWA Ecosystem">
      {/* Key Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Global Market Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${(ecosystemMetrics.totalMarketSize / 1e9).toFixed(2)}B</p>
            <div className="flex items-center gap-1 mt-1 text-success">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs">+{ecosystemMetrics.yearlyGrowth}% YoY</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Building className="h-4 w-4" />
              Active Issuers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{ecosystemMetrics.totalIssuers}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Across {ecosystemMetrics.activeJurisdictions} jurisdictions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Holders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(ecosystemMetrics.totalHolders / 1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground mt-1">Institutional & Retail</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Link className="h-4 w-4" />
              DeFi Integrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{ecosystemMetrics.defiIntegrations}</p>
            <p className="text-xs text-muted-foreground mt-1">Active protocols</p>
          </CardContent>
        </Card>
      </div>

      {/* Regional Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Regional Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regionalData.map((region) => (
                <div key={region.region} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{region.region}</p>
                      <p className="text-xs text-muted-foreground">
                        ${region.value}M ({region.percentage}%)
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {region.growth}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={region.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Blockchain Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Blockchain Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="10%" 
                  outerRadius="90%" 
                  data={blockchainData}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={10}
                    fill="hsl(var(--primary))"
                    className="fill-primary"
                  />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {blockchainData.map((chain) => (
                <div key={chain.name} className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    {chain.name}
                  </span>
                  <span className="font-medium">
                    {chain.value}% (${chain.tvl}M)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regulatory Landscape */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Global Regulatory Landscape
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regulatoryFrameworks.map((framework) => (
              <div key={framework.framework} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{framework.framework}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {framework.assets} regulated assets
                    </p>
                  </div>
                  <Badge 
                    variant={framework.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {framework.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Adoption Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Adoption Trends (2024)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adoptionData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="institutional" stackId="a" fill="#3b82f6" name="Institutional" />
                <Bar dataKey="retail" stackId="a" fill="#10b981" name="Retail" />
                <Bar dataKey="defi" stackId="a" fill="#8b5cf6" name="DeFi" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default GlobalOverview;