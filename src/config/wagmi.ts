import { createConfig, http } from 'wagmi';
import { baseSepolia, arbitrumSepolia, avalancheFuji, sepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// Configure chains
const chains = [baseSepolia, arbitrumSepolia, avalancheFuji, sepolia] as const;

// WalletConnect Project ID - You should get your own at https://cloud.walletconnect.com
// This is a public demo ID that may have limitations
const projectId = '2c25e0a1d9912b35459c32fa14f1e7ad';

export const config = createConfig({
  chains,
  connectors: [
    injected(),
    walletConnect({
      projectId,
      showQrModal: true,
      qrModalOptions: {
        themeMode: 'light',
      },
      metadata: {
        name: 'Circle Gateway Demo',
        description: 'USDC Cross-chain Management',
        url: window?.location?.origin || 'https://example.com',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
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