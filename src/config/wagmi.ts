import { createConfig, http } from 'wagmi';
import { baseSepolia, arbitrumSepolia, avalancheFuji, sepolia } from 'wagmi/chains';
import { walletConnect, injected } from 'wagmi/connectors';

// Define custom chains without using defineChain (to avoid TypeScript issues)
export const ethereumMyNet = {
  id: 12345,
  name: 'Ethereum MyNet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://ethereum-mynet-rpc.example.com'],
    },
    public: {
      http: ['https://ethereum-mynet-rpc.example.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://ethereum-mynet-explorer.example.com',
    },
  },
  testnet: true,
} as const;

export const baseMyNet = {
  id: 12346,
  name: 'Base MyNet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://base-mynet-rpc.example.com'],
    },
    public: {
      http: ['https://base-mynet-rpc.example.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://base-mynet-explorer.example.com',
    },
  },
  testnet: true,
} as const;

// Configure chains
const chains = [baseSepolia, arbitrumSepolia, avalancheFuji, sepolia, ethereumMyNet, baseMyNet] as const;

// WalletConnect project ID - you should get your own at https://cloud.walletconnect.com
const projectId = 'a5c4d8e6f2b3a1d7e9c8b4f6a2d1e8c5';

export const config = createConfig({
  chains,
  connectors: [
    injected(),
    walletConnect({ 
      projectId,
      metadata: {
        name: 'Circle Gateway Treasury',
        description: 'USDC Cross-chain Management',
        url: window.location.origin,
        icons: ['https://avatars.githubusercontent.com/u/37784886']
      },
      showQrModal: true
    }),
  ],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
    [arbitrumSepolia.id]: http('https://sepolia-rollup.arbitrum.io/rpc'),
    [avalancheFuji.id]: http('https://api.avax-test.network/ext/bc/C/rpc'),
    [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com'),
    [ethereumMyNet.id]: http('https://ethereum-mynet-rpc.example.com'),
    [baseMyNet.id]: http('https://base-mynet-rpc.example.com'),
  },
  ssr: false,
});