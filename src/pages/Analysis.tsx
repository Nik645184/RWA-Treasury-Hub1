
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Treemap, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Shield, AlertTriangle, DollarSign, BarChart3 } from 'lucide-react';
import { mockRWAAssets, formatNumber } from '@/utils/rwaApi';

const Analysis = () => {
  // RWA Market Analysis Data
  const sectorPerformance = [
    { name: 'Treasuries', value: 4.2, amount: 4.76 },
    { name: 'Private Credit', value: 12.5, amount: 12.2 },
    { name: 'Real Estate', value: 8.8, amount: 50.0 },
    { name: 'Commodities', value: -2.3, amount: 3.1 },
    { name: 'Trade Finance', value: 6.7, amount: 1.8 },
    { name: 'Carbon Credits', value: 15.2, amount: 0.9 },
  ];
  
  // Risk metrics for RWA assets
  const riskData = [
    { name: 'Liquidity Risk', value: 35 },
    { name: 'Regulatory Risk', value: 55 },
    { name: 'Smart Contract Risk', value: 25 },
    { name: 'Custody Risk', value: 30 },
    { name: 'Oracle Risk', value: 40 },
  ];
  
  // Chain distribution data
  const chainDistribution = [
    { name: 'Ethereum', value: 54.8, color: '#627EEA' },
    { name: 'Polygon', value: 18.3, color: '#8247E5' },
    { name: 'Avalanche', value: 12.1, color: '#E84142' },
    { name: 'Stellar', value: 8.5, color: '#14B8A6' },
    { name: 'Others', value: 6.3, color: '#6B7280' },
  ];
  
  // Top RWA assets performance
  const assetPerformance = mockRWAAssets
    .map(asset => ({
      name: asset.symbol,
      value: Math.abs(asset.changePercent),
      changePercent: asset.changePercent,
      tvl: asset.tvl
    }))
    .sort((a, b) => b.tvl - a.tvl);
  
  // Compliance metrics
  const complianceData = [
    { subject: 'KYC/AML', A: 95, fullMark: 100 },
    { subject: 'SEC Registration', A: 88, fullMark: 100 },
    { subject: 'MiCA Compliance', A: 75, fullMark: 100 },
    { subject: 'Tax Reporting', A: 92, fullMark: 100 },
    { subject: 'Investor Accreditation', A: 85, fullMark: 100 },
    { subject: 'Audit Compliance', A: 90, fullMark: 100 },
  ];
  
  // Yield comparison data
  const yieldComparison = [
    { asset: 'BUIDL', traditional: 5.2, tokenized: 5.4 },
    { asset: 'USYC', traditional: 5.5, tokenized: 5.8 },
    { asset: 'OUSG', traditional: 5.0, tokenized: 5.3 },
    { asset: 'Private Credit', traditional: 8.5, tokenized: 9.2 },
    { asset: 'Real Estate', traditional: 6.0, tokenized: 7.1 },
  ];
  
  // Monthly growth trend
  const growthTrend = [
    { month: 'Jan', aum: 2.1, holders: 280 },
    { month: 'Feb', aum: 2.3, holders: 295 },
    { month: 'Mar', aum: 2.8, holders: 310 },
    { month: 'Apr', aum: 3.2, holders: 325 },
    { month: 'May', aum: 3.8, holders: 335 },
    { month: 'Jun', aum: 4.1, holders: 345 },
  ];
  
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  
  // Custom content for the treemap
  const CustomizedContent = (props: any) => {
    const { x, y, width, height, name, changePercent } = props;
    const safeChangePercent = changePercent ?? 0;
    const color = safeChangePercent >= 0 ? "#10b981" : "#ef4444";
    const cellValue = safeChangePercent >= 0 ? `+${safeChangePercent.toFixed(2)}%` : `${safeChangePercent.toFixed(2)}%`;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: color,
            stroke: '#fff',
            strokeWidth: 2,
          }}
        />
        {width > 50 && height > 30 ? (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 6}
              textAnchor="middle"
              fill="#fff"
              fontSize={14}
              fontWeight="bold"
            >
              {name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 12}
              textAnchor="middle"
              fill="#fff"
              fontSize={12}
            >
              {cellValue}
            </text>
          </>
        ) : null}
      </g>
    );
  };
  
  return (
    <PageLayout title="RWA Analytics & Risk Assessment">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              RWA Sector Performance (YTD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorPerformance} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'Performance']} />
                  <Bar dataKey="value" name="YTD %" radius={[4, 4, 0, 0]}>
                    {sectorPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Risk Assessment Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Risk Assessment Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={riskData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Risk Level"
                    dataKey="value"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Asset Performance Heatmap */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>RWA Asset Performance Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={assetPerformance}
                    dataKey="value"
                    aspectRatio={4/3}
                    stroke="#fff"
                    content={<CustomizedContent />}
                  />
                </ResponsiveContainer>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Asset size represents TVL, color indicates performance (green: positive, red: negative)
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Chain Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Chain Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chainDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chainDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Compliance Score */}
        <Card>
          <CardHeader>
            <CardTitle>Regulatory Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={complianceData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar
                    name="Compliance %"
                    dataKey="A"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.5}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Yield Comparison */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Traditional vs Tokenized Yield Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yieldComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="asset" />
                    <YAxis label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Yield']} />
                    <Legend />
                    <Bar dataKey="traditional" fill="#6b7280" name="Traditional" />
                    <Bar dataKey="tokenized" fill="#4f46e5" name="Tokenized" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Growth Trend */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>RWA Market Growth Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" label={{ value: 'AUM ($B)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Holders (K)', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="aum" stroke="#4f46e5" strokeWidth={2} name="AUM ($B)" />
                    <Line yAxisId="right" type="monotone" dataKey="holders" stroke="#10b981" strokeWidth={2} name="Holders (K)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Key Insights */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Key Risk Indicators & Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                  <div>
                    <h3 className="font-medium">Liquidity Fragmentation</h3>
                    <p className="text-sm text-muted-foreground">Cross-chain liquidity is fragmented across 5+ chains</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-yellow-600">MEDIUM RISK</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg border-green-200 bg-green-50 dark:bg-green-900/20">
                  <div>
                    <h3 className="font-medium">Oracle Verification</h3>
                    <p className="text-sm text-muted-foreground">All assets verified via Chainlink PoR</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">LOW RISK</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg border-red-200 bg-red-50 dark:bg-red-900/20">
                  <div>
                    <h3 className="font-medium">Regulatory Changes</h3>
                    <p className="text-sm text-muted-foreground">MiCA implementation pending in EU markets</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">HIGH RISK</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg border-green-200 bg-green-50 dark:bg-green-900/20">
                  <div>
                    <h3 className="font-medium">Smart Contract Audit</h3>
                    <p className="text-sm text-muted-foreground">95% of TVL in audited contracts</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">LOW RISK</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Analysis;
