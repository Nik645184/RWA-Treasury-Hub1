import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Smartphone, Copy, CheckCircle, XCircle } from 'lucide-react';

interface SimpleWalletConnectProps {
  onConnect: () => void;
  isPending: boolean;
}

export const SimpleWalletConnect: React.FC<SimpleWalletConnectProps> = ({ onConnect, isPending }) => {
  const [showQR, setShowQR] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');
  const [copied, setCopied] = useState(false);
  
  // For demo purposes - in production, this would be a real WalletConnect URI
  const demoWalletConnectURI = 'wc:demo-connection-string-for-mobile-wallet';
  
  const handleMobileConnect = () => {
    setConnectionStatus('connecting');
    setShowQR(true);
    
    // Simulate connection attempt
    setTimeout(() => {
      setConnectionStatus('failed');
      setTimeout(() => {
        setConnectionStatus('idle');
        setShowQR(false);
      }, 3000);
    }, 5000);
  };
  
  const handleManualConnect = () => {
    if (!walletAddress) {
      alert('Please enter your wallet address');
      return;
    }
    
    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      alert('Please enter a valid Ethereum address');
      return;
    }
    
    setConnectionStatus('connected');
    // In a real app, this would establish a connection
    alert(`Demo: Would connect to wallet ${walletAddress}`);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(demoWalletConnectURI);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (showQR) {
    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Connect Mobile Wallet</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowQR(false);
              setConnectionStatus('idle');
            }}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {connectionStatus === 'connecting' && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Waiting for wallet connection... Open your mobile wallet and scan the QR code or copy the connection string.
              </AlertDescription>
            </Alert>
          )}
          
          {connectionStatus === 'failed' && (
            <Alert className="border-destructive">
              <XCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                Connection failed. Please try again or use MetaMask extension.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
            <div className="w-48 h-48 bg-background rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <Smartphone className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">QR Code Placeholder</p>
                <p className="text-xs text-muted-foreground mt-1">Scan with wallet app</p>
              </div>
            </div>
            
            <div className="w-full space-y-2">
              <Label className="text-xs text-muted-foreground">Or copy connection string:</Label>
              <div className="flex gap-2">
                <Input 
                  value={demoWalletConnectURI} 
                  readOnly 
                  className="text-xs font-mono"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                >
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Supported wallets: MetaMask Mobile, Trust Wallet, Rainbow</p>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <Button
        onClick={handleMobileConnect}
        disabled={isPending}
        variant="outline"
        className="w-full"
        size="lg"
      >
        <Smartphone className="mr-2 h-4 w-4" />
        Connect Mobile Wallet (Demo)
      </Button>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or manually</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="wallet-address">Enter wallet address (for demo)</Label>
        <div className="flex gap-2">
          <Input
            id="wallet-address"
            placeholder="0x..."
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
          />
          <Button
            onClick={handleManualConnect}
            disabled={!walletAddress}
          >
            Connect
          </Button>
        </div>
      </div>
      
      {connectionStatus === 'connected' && (
        <Alert className="border-green-500">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-600">
            Demo: Connected to {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};