import { createConfig, http } from 'wagmi';
import { baseSepolia, arbitrumSepolia, avalancheFuji, sepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// Configure chains
const chains = [baseSepolia, arbitrumSepolia, avalancheFuji, sepolia] as const;

// WalletConnect Project ID - using a generic one for testing
const projectId = '3fcc6bba6f1de962d911bb5b5c3dba68';

export const config = createConfig({
  chains,
  connectors: [
    injected(),
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: 'Circle Gateway',
        description: 'USDC Cross-chain Management',
        url: 'https://gateway.circle.com',
        icons: ['https://gateway.circle.com/icon.png'],
      },
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [avalancheFuji.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: false,
});