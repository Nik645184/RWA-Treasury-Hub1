import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { RWAMetricsCard } from '@/components/rwa/RWAMetricsCard';
import { RWAAssetCard } from '@/components/rwa/RWAAssetCard';
import { AssetAllocationChart } from '@/components/rwa/AssetAllocationChart';
import { TransactionList } from '@/components/rwa/TransactionList';
import { 
  calculateRWAMetrics, 
  mockRWAAssets, 
  mockTransactions,
  formatValue,
  getAssetsByCategory,
  useRWAData
} from '@/utils/rwaApi';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  Shield,
  Globe,
  Building,
  Layers
} from 'lucide-react';

const Dashboard = () => {
  const metrics = calculateRWAMetrics();
  const assets = useRWAData(mockRWAAssets);
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  
  // Calculate allocation data
  const allocationData = [
    { name: 'Treasuries', value: getAssetsByCategory('treasury').reduce((sum, a) => sum + a.aum, 0) },
    { name: 'Private Credit', value: getAssetsByCategory('private-credit').reduce((sum, a) => sum + a.aum, 0) },
    { name: 'Real Estate', value: getAssetsByCategory('real-estate').reduce((sum, a) => sum + a.aum, 0) },
    { name: 'Commodities', value: getAssetsByCategory('commodity').reduce((sum, a) => sum + a.aum, 0) }
  ];

  return (
    <PageLayout title="Treasury Management Dashboard">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <RWAMetricsCard
          title="Total AUM"
          value={formatValue(metrics.totalAUM)}
          change={metrics.growthRate}
          trend="up"
          subtitle="Across all tokenized assets"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <RWAMetricsCard
          title="Total Holders"
          value={metrics.totalHolders.toLocaleString()}
          change={12.5}
          trend="up"
          subtitle={`${metrics.totalIssuers} active issuers`}
          icon={<Users className="h-5 w-5" />}
        />
        <RWAMetricsCard
          title="Daily Volume"
          value={formatValue(metrics.dailyVolume)}
          change={-2.3}
          trend="down"
          subtitle="24h trading volume"
          icon={<Activity className="h-5 w-5" />}
        />
        <RWAMetricsCard
          title="Active Chains"
          value={metrics.activeChains}
          subtitle="Cross-chain coverage"
          icon={<Globe className="h-5 w-5" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Tokenized Assets Portfolio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assets.slice(0, 6).map((asset) => (
              <RWAAssetCard
                key={asset.id}
                asset={asset}
                selected={selectedAsset?.id === asset.id}
                onClick={() => setSelectedAsset(asset)}
              />
            ))}
          </div>
        </div>

        {/* Allocation Chart */}
        <div className="space-y-6">
          <AssetAllocationChart 
            data={allocationData}
            title="Portfolio Allocation"
          />
          
          {/* Quick Stats */}
          <div className="bg-card rounded-lg p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Risk Overview
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg. Liquidity Score</span>
                <span className="font-medium">72/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg. Risk Score</span>
                <span className="font-medium text-warning">35/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Collateralization</span>
                <span className="font-medium text-success">108%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">TVL in DeFi</span>
                <span className="font-medium">{formatValue(metrics.tvlDeFi)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="mt-6">
        <TransactionList 
          transactions={mockTransactions}
          title="Recent Transactions"
        />
      </div>
    </PageLayout>
  );
};

export default Dashboard;