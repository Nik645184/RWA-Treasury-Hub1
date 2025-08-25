
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { CircleGatewayWidget } from '@/components/currencies/CircleGatewayWidget';

const Currencies = () => {
  return (
    <PageLayout title="USDC Treasury Management">
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Circle Gateway Integration</h1>
          <p className="text-muted-foreground">
            Unified USDC balance management across 7+ blockchains with instant cross-chain transfers powered by CCTP V2
          </p>
        </div>
        
        <CircleGatewayWidget />
      </div>
    </PageLayout>
  );
};

export default Currencies;
