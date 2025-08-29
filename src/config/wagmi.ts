
import { createConfig, http } from 'wagmi';
import { 
  base, 
  mainnet,
  baseSepolia, 
  arbitrumSepolia, 
  avalancheFuji, 
  sepolia 
} from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// Configure chains - include both mainnet and testnet
const chains = [
  mainnet,
  base,
  baseSepolia, 
  arbitrumSepolia, 
  avalancheFuji, 
  sepolia
] as const;

export const config = createConfig({
  chains,
  connectors: [
    injected(), // This will automatically detect MetaMask and other injected wallets
  ],
  transports: {
    // Mainnet chains
    [mainnet.id]: http('https://eth.llamarpc.com'),
    [base.id]: http('https://mainnet.base.org'),
    // Testnet chains
    [baseSepolia.id]: http('https://sepolia.base.org'),
    [arbitrumSepolia.id]: http('https://sepolia-rollup.arbitrum.io/rpc'),
    [avalancheFuji.id]: http('https://api.avax-test.network/ext/bc/C/rpc'),
    [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com'),
  },
  ssr: false,
});
