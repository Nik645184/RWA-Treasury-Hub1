// Circle Gateway Mainnet Addresses
export const GATEWAY_WALLET_ADDRESS_MAINNET = '0x77777777Dcc4d5A8B6E418Fd04D8997ef11000eE';
export const GATEWAY_MINTER_ADDRESS_MAINNET = '0x2222222d7164433c4C09B0b0D809a9b52C04C205';

// Circle Gateway Testnet Addresses
export const GATEWAY_WALLET_ADDRESS_TESTNET = '0x0077777d7EBA4688BDeF3E311b846F25870A19B9';
export const GATEWAY_MINTER_ADDRESS_TESTNET = '0x0022222ABE238Cc2C7Bb1f21003F0a260052475B';

// USDC Token Addresses (Mainnet)
export const USDC_ADDRESSES_MAINNET = {
  ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Ethereum Mainnet
  base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base Mainnet
} as const;

// USDC Token Addresses (Testnet)
export const USDC_ADDRESSES_TESTNET = {
  sepolia: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  baseSepolia: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  avalancheFuji: '0x5425890298aed601595a70ab815c96711a31bc65',
} as const;

// Helper to get addresses based on chain
export const getGatewayWalletAddress = (isMainnet: boolean) => 
  isMainnet ? GATEWAY_WALLET_ADDRESS_MAINNET : GATEWAY_WALLET_ADDRESS_TESTNET;

export const getGatewayMinterAddress = (isMainnet: boolean) => 
  isMainnet ? GATEWAY_MINTER_ADDRESS_MAINNET : GATEWAY_MINTER_ADDRESS_TESTNET;

export const getUsdcAddress = (chainId: number): string | undefined => {
  const mainnetMap: Record<number, string> = {
    1: USDC_ADDRESSES_MAINNET.ethereum,
    8453: USDC_ADDRESSES_MAINNET.base,
  };
  const testnetMap: Record<number, string> = {
    11155111: USDC_ADDRESSES_TESTNET.sepolia,
    84532: USDC_ADDRESSES_TESTNET.baseSepolia,
    43113: USDC_ADDRESSES_TESTNET.avalancheFuji,
  };
  return mainnetMap[chainId] || testnetMap[chainId];
};

// Chain Domain IDs for Circle Gateway
export const CHAIN_DOMAINS = {
  ethereum: 0,
  sepolia: 0,
  avalanche: 1,
  avalancheFuji: 1,
  base: 6,
  baseSepolia: 6,
} as const;

// Gateway API Base URLs
export const GATEWAY_API_BASE_URL_MAINNET = 'https://gateway-api.circle.com/v1';
export const GATEWAY_API_BASE_URL_TESTNET = 'https://gateway-api-testnet.circle.com/v1';

// Chain names mapping
export const CHAIN_NAMES: Record<number, string> = {
  0: 'Ethereum',
  1: 'Avalanche',
  6: 'Base',
};