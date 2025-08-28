
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import CircleGatewayLive from '@/components/currencies/CircleGatewayLive';

const Currencies = () => {
  return (
    <PageLayout title="USDC Treasury Management">
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Circle Gateway Live Integration</h1>
          <p className="text-muted-foreground">
            Connect your wallet to manage USDC across multiple testnets with instant cross-chain transfers
          </p>
        </div>
        
        <CircleGatewayLive />
      </div>
    </PageLayout>
  );
};

export default Currencies;
