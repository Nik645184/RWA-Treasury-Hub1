import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Activity,
  Users,
  Layers
} from 'lucide-react';
import { TokenizedAsset, formatValue } from '@/utils/rwaApi';
import { cn } from '@/lib/utils';

interface RWAAssetCardProps {
  asset: TokenizedAsset;
  onClick?: () => void;
  selected?: boolean;
}

export function RWAAssetCard({ asset, onClick, selected }: RWAAssetCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'treasury': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'private-credit': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'real-estate': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'commodity': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-success';
    if (score < 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg',
        selected && 'ring-2 ring-primary'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{asset.symbol}</h3>
              <Badge 
                variant="secondary" 
                className={cn('text-xs', getCategoryColor(asset.category))}
              >
                {asset.category.replace('-', ' ').toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {asset.name}
            </p>
            <p className="text-xs text-muted-foreground">
              Issued by {asset.issuer}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {asset.yield > 0 ? `${asset.yield.toFixed(2)}%` : '-'}
            </p>
            <p className="text-xs text-muted-foreground">APY</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Price and Change */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="text-xl font-semibold">
              ${asset.price < 10 ? asset.price.toFixed(4) : asset.price.toFixed(2)}
            </p>
          </div>
          <div className={cn(
            'flex items-center gap-1',
            asset.changePercent >= 0 ? 'text-success' : 'text-destructive'
          )}>
            {asset.changePercent >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="font-medium">
              {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* AUM and Volume */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Layers className="h-3 w-3" />
              AUM
            </p>
            <p className="text-sm font-medium">{formatValue(asset.aum)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" />
              24h Volume
            </p>
            <p className="text-sm font-medium">{formatValue(asset.dailyVolume)}</p>
          </div>
        </div>

        {/* Risk and Liquidity Scores */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Risk Score
              </span>
              <span className={cn('font-medium', getRiskColor(asset.riskScore))}>
                {asset.riskScore}/100
              </span>
            </div>
            <Progress value={asset.riskScore} className="h-1.5" />
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Liquidity
              </span>
              <span className="font-medium">{asset.liquidityScore}/100</span>
            </div>
            <Progress value={asset.liquidityScore} className="h-1.5" />
          </div>
        </div>

        {/* Blockchain and Compliance */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {asset.blockchain.map((chain) => (
              <Badge key={chain} variant="outline" className="text-xs">
                {chain}
              </Badge>
            ))}
          </div>
          
          {asset.complianceFramework && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              {asset.complianceFramework[0]}
            </div>
          )}
        </div>

        {/* Holders and Maturity */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {asset.holders.toLocaleString()} holders
          </span>
          {asset.maturity && (
            <span>Maturity: {asset.maturity}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}