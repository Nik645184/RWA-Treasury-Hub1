import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAccount, useWalletClient } from 'wagmi';
import { maxUint256 } from 'viem';
import { toast } from 'sonner';

const TestSignature = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  
  const testSimpleSignature = async () => {
    if (!walletClient || !address) {
      toast.error('Please connect wallet first');
      return;
    }
    
    setStatus('Testing simple message signature...');
    setError('');
    
    try {
      const message = 'Test message for Gateway';
      const signature = await walletClient.signMessage({
        account: address,
        message,
      });
      
      setStatus(`✅ Simple signature works! Signature: ${signature.slice(0, 20)}...`);
      toast.success('Simple signature successful!');
    } catch (err: any) {
      setError(`Simple signature failed: ${err.message}`);
      console.error('Simple signature error:', err);
    }
  };
  
  const testTypedDataSignature = async () => {
    if (!walletClient || !address) {
      toast.error('Please connect wallet first');
      return;
    }
    
    setStatus('Testing typed data signature...');
    setError('');
    
    try {
      // Test with minimal typed data first
      const domain = {
        name: 'GatewayWallet',
        version: '1',
      };
      
      const types = {
        Test: [
          { name: 'amount', type: 'uint256' },
          { name: 'message', type: 'string' },
        ],
      };
      
      const message = {
        amount: '1000000', // 1 USDC as string
        message: 'Test transfer',
      };
      
      console.log('Signing typed data:', { domain, types, message });
      
      const signature = await walletClient.signTypedData({
        account: address,
        domain,
        types,
        primaryType: 'Test' as const,
        message,
      });
      
      setStatus(`✅ Typed data signature works! Signature: ${signature.slice(0, 20)}...`);
      toast.success('Typed data signature successful!');
    } catch (err: any) {
      setError(`Typed data signature failed: ${err.message}`);
      console.error('Typed data signature error:', err);
    }
  };
  
  const testGatewaySignature = async () => {
    if (!walletClient || !address) {
      toast.error('Please connect wallet first');
      return;
    }
    
    setStatus('Testing Gateway burn intent signature...');
    setError('');
    
    try {
      // Exact Gateway format but with simplified data
      const domain = {
        name: 'GatewayWallet',
        version: '1',
      };
      
      const types = {
        TransferSpec: [
          { name: 'version', type: 'uint32' },
          { name: 'sourceDomain', type: 'uint32' },
          { name: 'destinationDomain', type: 'uint32' },
          { name: 'sourceContract', type: 'bytes32' },
          { name: 'destinationContract', type: 'bytes32' },
          { name: 'sourceToken', type: 'bytes32' },
          { name: 'destinationToken', type: 'bytes32' },
          { name: 'sourceDepositor', type: 'bytes32' },
          { name: 'destinationRecipient', type: 'bytes32' },
          { name: 'sourceSigner', type: 'bytes32' },
          { name: 'destinationCaller', type: 'bytes32' },
          { name: 'value', type: 'uint256' },
          { name: 'salt', type: 'bytes32' },
          { name: 'hookData', type: 'bytes' },
        ],
        BurnIntent: [
          { name: 'maxBlockHeight', type: 'uint256' },
          { name: 'maxFee', type: 'uint256' },
          { name: 'spec', type: 'TransferSpec' },
        ],
      };
      
      // Create test message with all values as strings to avoid BigInt issues
      const message = {
        maxBlockHeight: maxUint256.toString(),
        maxFee: '100000', // 0.1 USDC
        spec: {
          version: 1,
          sourceDomain: 0,
          destinationDomain: 6,
          sourceContract: '0x' + '77777777Dcc4d5A8B6E418Fd04D8997ef11000eE'.toLowerCase().padStart(64, '0'),
          destinationContract: '0x' + '2222222d7164433c4C09B0b0D809a9b52C04C205'.toLowerCase().padStart(64, '0'),
          sourceToken: '0x' + 'A0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'.toLowerCase().padStart(64, '0'),
          destinationToken: '0x' + '833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'.toLowerCase().padStart(64, '0'),
          sourceDepositor: '0x' + address.slice(2).toLowerCase().padStart(64, '0'),
          destinationRecipient: '0x' + address.slice(2).toLowerCase().padStart(64, '0'),
          sourceSigner: '0x' + address.slice(2).toLowerCase().padStart(64, '0'),
          destinationCaller: '0x' + '0'.repeat(64),
          value: '5000000', // 5 USDC as string
          salt: '0x' + Math.random().toString(16).slice(2).padEnd(64, '0'),
          hookData: '0x',
        },
      };
      
      console.log('Signing Gateway burn intent:', { domain, types, message });
      
      const signature = await walletClient.signTypedData({
        account: address,
        domain,
        types,
        primaryType: 'BurnIntent' as const,
        message,
      });
      
      setStatus(`✅ Gateway signature works! Signature: ${signature.slice(0, 20)}...`);
      toast.success('Gateway signature successful!');
      
      // Log full details for debugging
      console.log('Successful Gateway signature:', {
        signature,
        domain,
        types,
        message,
      });
      
    } catch (err: any) {
      setError(`Gateway signature failed: ${err.message}`);
      console.error('Gateway signature error:', err);
      
      // Try to identify the specific issue
      if (err.message?.includes('BigInt')) {
        setError(error + '\nIssue: BigInt serialization problem');
      } else if (err.message?.includes('User rejected')) {
        setError(error + '\nIssue: User cancelled the signature');
      } else if (err.message?.includes('Invalid typed data')) {
        setError(error + '\nIssue: Typed data format is incorrect');
      }
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Signature Testing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Test different signature methods to debug MetaMask issues
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <Button 
            onClick={testSimpleSignature}
            variant="outline" 
            className="w-full"
          >
            Test 1: Simple Message Signature
          </Button>
          
          <Button 
            onClick={testTypedDataSignature}
            variant="outline" 
            className="w-full"
          >
            Test 2: Basic Typed Data Signature
          </Button>
          
          <Button 
            onClick={testGatewaySignature}
            variant="outline" 
            className="w-full"
          >
            Test 3: Full Gateway Burn Intent Signature
          </Button>
        </div>
        
        {status && (
          <Alert className="border-green-500">
            <AlertDescription className="text-green-600">
              {status}
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert className="border-red-500">
            <AlertDescription className="text-red-600 whitespace-pre-wrap">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default TestSignature;