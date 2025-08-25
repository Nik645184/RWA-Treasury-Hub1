import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  Activity, 
  Shield, 
  TrendingUp,
  Layers,
  Globe,
  Zap
} from 'lucide-react';

interface ChainBalance {
  chain: string;
  balance: number;
  percentage: number;
  yield: number;
  color: string;
  logo?: string;
}

const chainBalances: ChainBalance[] = [
  { chain: 'Ethereum', balance: 23500000, percentage: 36.0, yield: 4.2, color: 'bg-blue-500' },
  { chain: 'Arbitrum', balance: 12300000, percentage: 18.9, yield: 5.8, color: 'bg-orange-500' },
  { chain: 'Base', balance: 10000000, percentage: 15.3, yield: 5.1, color: 'bg-blue-400' },
  { chain: 'Avalanche', balance: 8000000, percentage: 12.3, yield: 4.9, color: 'bg-red-500' },
  { chain: 'OP Mainnet', balance: 5000000, percentage: 7.7, yield: 5.3, color: 'bg-red-400' },
  { chain: 'Polygon PoS', balance: 4000000, percentage: 6.1, yield: 4.5, color: 'bg-purple-500' },
  { chain: 'Unichain', balance: 2400000, percentage: 3.7, yield: 6.2, color: 'bg-pink-500' }
];

export const USDCMultichainBalance = () => {
  const totalBalance = chainBalances.reduce((sum, chain) => sum + chain.balance, 0);
  const avgYield = chainBalances.reduce((sum, chain) => sum + chain.yield * chain.percentage / 100, 0);
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total USDC Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalBalance / 1000000).toFixed(1)}M
            </div>
            <div className="flex items-center gap-1 mt-1 text-success">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs">+8.3% (24h)</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Chains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">7</div>
              <Globe className="h-4 w-4 text-primary" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Unified via Circle Gateway
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Weighted APY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{avgYield.toFixed(2)}%</div>
              <Activity className="h-4 w-4 text-success" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Optimized allocation
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Chain Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>USDC Distribution by Chain</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Fast Transfers Active
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                CCTP V2
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {chainBalances.map((chain) => (
            <div key={chain.chain} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${chain.color}`} />
                  <div>
                    <p className="font-medium">{chain.chain}</p>
                    <p className="text-xs text-muted-foreground">
                      ${(chain.balance / 1000000).toFixed(1)}M ({chain.percentage}%)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">{chain.yield}% APY</p>
                    <p className="text-xs text-muted-foreground">
                      +${((chain.balance * chain.yield / 100) / 1000000).toFixed(2)}M/yr
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Progress value={chain.percentage} className="h-1.5" />
            </div>
          ))}
          
          {/* Quick Actions */}
          <div className="pt-4 border-t grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              <Layers className="h-4 w-4 mr-2" />
              Rebalance
            </Button>
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Optimize Yield
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};