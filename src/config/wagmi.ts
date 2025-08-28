import { createConfig, http } from 'wagmi';
import { baseSepolia, arbitrumSepolia, avalancheFuji, sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// Configure chains
const chains = [baseSepolia, arbitrumSepolia, avalancheFuji, sepolia] as const;

export const config = createConfig({
  chains,
  connectors: [
    injected(),
  ],
  transports: {
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [avalancheFuji.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: false,
});