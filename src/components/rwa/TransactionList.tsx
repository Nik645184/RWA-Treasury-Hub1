import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Send,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Transaction, formatValue } from '@/utils/rwaApi';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
  showFilters?: boolean;
  compact?: boolean;
}

export function TransactionList({ 
  transactions, 
  title = 'Recent Transactions',
  showFilters = true,
  compact = false 
}: TransactionListProps) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'emission': return <ArrowUpRight className="h-4 w-4" />;
      case 'transfer': return <Send className="h-4 w-4" />;
      case 'settlement': return <RefreshCw className="h-4 w-4" />;
      case 'redemption': return <ArrowDownLeft className="h-4 w-4" />;
      case 'cross-chain': return <Globe className="h-4 w-4" />;
      default: return <Send className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'emission': return 'text-green-500 bg-green-500/10';
      case 'transfer': return 'text-blue-500 bg-blue-500/10';
      case 'settlement': return 'text-purple-500 bg-purple-500/10';
      case 'redemption': return 'text-orange-500 bg-orange-500/10';
      case 'cross-chain': return 'text-indigo-500 bg-indigo-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'failed': return <XCircle className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'pending': return 'text-warning';
      case 'failed': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const truncateAddress = (address: string) => {
    if (address.startsWith('0x')) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return address.length > 20 ? `${address.slice(0, 20)}...` : address;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {showFilters && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Filter
              </Button>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className={cn(
                'flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50',
                compact && 'p-3'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn('p-2 rounded-full', getTransactionColor(tx.type))}>
                  {getTransactionIcon(tx.type)}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{tx.asset}</span>
                    <Badge variant="secondary" className="text-xs">
                      {tx.type.replace('-', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {tx.blockchain}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <span className="font-mono">{truncateAddress(tx.from)}</span>
                    <span className="mx-2">→</span>
                    <span className="font-mono">{truncateAddress(tx.to)}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{format(tx.timestamp, 'MMM dd, HH:mm')}</span>
                    <a 
                      href={`#tx/${tx.txHash}`}
                      className="font-mono hover:text-primary transition-colors"
                    >
                      {truncateAddress(tx.txHash)}
                    </a>
                    {tx.gasUsed && (
                      <span>Gas: {tx.gasUsed.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right space-y-1">
                <p className="font-semibold text-lg">
                  {formatValue(tx.amount)}
                </p>
                <div className={cn('flex items-center gap-1 justify-end', getStatusColor(tx.status))}>
                  {getStatusIcon(tx.status)}
                  <span className="text-xs capitalize">{tx.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}