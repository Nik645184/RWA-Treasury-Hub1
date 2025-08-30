
import { createConfig, http } from 'wagmi';
import { 
  base, 
  mainnet,
} from 'wagmi/chains';
import { walletConnect, injected } from 'wagmi/connectors';

// Configure chains - MAINNET ONLY
const chains = [
  mainnet,
  base,
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
    // Mainnet chains only
    [mainnet.id]: http('https://eth.llamarpc.com'),
    [base.id]: http('https://mainnet.base.org'),
  },
  ssr: false,
});
