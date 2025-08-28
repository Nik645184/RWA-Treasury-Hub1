import { pad, zeroAddress, maxUint256, type Address } from 'viem';
import { randomBytes } from 'crypto';

const domain = { name: 'GatewayWallet', version: '1' };

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
  amount: bigint;
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
}: BurnIntentParams) {
  return {
    maxBlockHeight: maxUint256,
    maxFee: 2_010000n, // 2.01 USDC covers fees for any chain
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
      sourceSigner: sourceDepositor,
      destinationCaller: zeroAddress,
      value: amount,
      salt: generateSalt(),
      hookData: '0x' as `0x${string}`,
    },
  };
}

export function burnIntentTypedData(burnIntent: ReturnType<typeof createBurnIntent>) {
  return {
    types: { EIP712Domain, TransferSpec, BurnIntent },
    domain,
    primaryType: 'BurnIntent' as const,
    message: {
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