import { pad, zeroAddress, maxUint256, parseUnits, type Address } from 'viem';

// Domain needs chainId and verifyingContract for mainnet
const domain = { 
  name: 'GatewayWallet', 
  version: '1',
  // Note: Circle Gateway doesn't use chainId or verifyingContract in domain
  // This is intentional to allow cross-chain signatures
};

const EIP712Domain = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
];

const TransferSpec = [
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
];

const BurnIntent = [
  { name: 'maxBlockHeight', type: 'uint256' },
  { name: 'maxFee', type: 'uint256' },
  { name: 'spec', type: 'TransferSpec' },
];

function addressToBytes32(address: string): `0x${string}` {
  return pad(address.toLowerCase() as Address, { size: 32 });
}

// Generate random salt for transfer uniqueness
function generateSalt(): `0x${string}` {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')}`;
}

export interface BurnIntentParams {
  sourceDomain: number;
  destinationDomain: number;
  sourceContract: string;
  destinationContract: string;
  sourceToken: string;
  destinationToken: string;
  sourceDepositor: string;
  destinationRecipient: string;
  amount: string; // Changed to string to accept decimal input
  sourceSigner?: string;
}

export function createBurnIntent({
  sourceDomain,
  destinationDomain,
  sourceContract,
  destinationContract,
  sourceToken,
  destinationToken,
  sourceDepositor,
  destinationRecipient,
  amount,
  sourceSigner,
}: BurnIntentParams, isMainnet: boolean = false) {
  // Use official Circle Gateway fees from documentation
  const getFeeForDomain = (domain: number, mainnet: boolean) => {
    if (!mainnet) return 100000n; // 0.1 USDC for testnet (for easier testing)
    
    // Official mainnet fees from Circle documentation
    switch(domain) {
      case 0: return 2_000000n;  // Ethereum: $2.00 USDC
      case 1: return 20000n;     // Avalanche: $0.02 USDC
      case 2: return 1500n;      // OP: $0.0015 USDC
      case 3: return 10000n;     // Arbitrum: $0.01 USDC
      case 6: return 10000n;     // Base: $0.01 USDC
      case 7: return 1500n;      // Polygon: $0.0015 USDC
      case 10: return 1000n;     // Unichain: $0.001 USDC
      default: return 2_000000n; // Default: $2.00 USDC
    }
  };
  
  return {
    maxBlockHeight: maxUint256,
    maxFee: getFeeForDomain(sourceDomain, isMainnet),
    spec: {
      version: 1,
      sourceDomain,
      destinationDomain,
      sourceContract,
      destinationContract,
      sourceToken,
      destinationToken,
      sourceDepositor,
      destinationRecipient,
      sourceSigner: sourceSigner || sourceDepositor,
      destinationCaller: zeroAddress,
      value: parseUnits(amount, 6), // Convert amount to bigint with 6 decimals
      salt: generateSalt(),
      hookData: '0x' as `0x${string}`,
    },
  };
}

export function burnIntentTypedData(burnIntent: ReturnType<typeof createBurnIntent>) {
  // Return typed data with BigInt values for wallet signing
  return {
    types: { EIP712Domain, TransferSpec, BurnIntent },
    domain,
    primaryType: 'BurnIntent' as const,
    message: {
      // Keep BigInt values for wallet signing
      ...burnIntent,
      spec: {
        ...burnIntent.spec,
        sourceContract: addressToBytes32(burnIntent.spec.sourceContract),
        destinationContract: addressToBytes32(burnIntent.spec.destinationContract),
        sourceToken: addressToBytes32(burnIntent.spec.sourceToken),
        destinationToken: addressToBytes32(burnIntent.spec.destinationToken),
        sourceDepositor: addressToBytes32(burnIntent.spec.sourceDepositor),
        destinationRecipient: addressToBytes32(burnIntent.spec.destinationRecipient),
        sourceSigner: addressToBytes32(burnIntent.spec.sourceSigner),
        destinationCaller: addressToBytes32(burnIntent.spec.destinationCaller ?? zeroAddress),
      },
    },
  };
}