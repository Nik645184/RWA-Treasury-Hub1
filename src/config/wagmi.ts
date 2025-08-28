
import { createConfig, http } from 'wagmi';
import { baseSepolia, arbitrumSepolia, avalancheFuji, sepolia } from 'wagmi/chains';
import { walletConnect, injected } from 'wagmi/connectors';

// Configure chains
const chains = [baseSepolia, arbitrumSepolia, avalancheFuji, sepolia] as const;

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
  },
  ssr: false,
});
