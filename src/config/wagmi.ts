
import { createConfig, http } from 'wagmi';
import { 
  base, 
  mainnet,
  baseSepolia, 
  arbitrumSepolia, 
  avalancheFuji, 
  sepolia 
} from 'wagmi/chains';
import { walletConnect, injected } from 'wagmi/connectors';

// Configure chains - include both mainnet and testnet
const chains = [
  mainnet,
  base,
  baseSepolia, 
  arbitrumSepolia, 
  avalancheFuji, 
  sepolia
] as const;

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
