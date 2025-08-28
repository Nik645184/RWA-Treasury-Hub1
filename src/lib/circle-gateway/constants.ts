// Circle Gateway Testnet Addresses
export const GATEWAY_WALLET_ADDRESS = '0x0077777d7EBA4688BDeF3E311b846F25870A19B9';
export const GATEWAY_MINTER_ADDRESS = '0x0022222ABE238Cc2C7Bb1f21003F0a260052475B';

// USDC Token Addresses (Testnet)
export const USDC_ADDRESSES = {
  sepolia: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  baseSepolia: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  avalancheFuji: '0x5425890298aed601595a70ab815c96711a31bc65',
  arbitrumSepolia: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
} as const;

// Chain Domain IDs for Circle Gateway
export const CHAIN_DOMAINS = {
  ethereum: 0,
  sepolia: 0,
  avalanche: 1,
  avalancheFuji: 1,
  base: 6,
  baseSepolia: 6,
  arbitrum: 3,
  arbitrumSepolia: 3,
} as const;

// Gateway API Base URL
export const GATEWAY_API_BASE_URL = 'https://gateway-api-testnet.circle.com/v1';

// Chain names mapping
export const CHAIN_NAMES: Record<number, string> = {
  0: 'Ethereum',
  1: 'Avalanche',
  3: 'Arbitrum',
  6: 'Base',
};