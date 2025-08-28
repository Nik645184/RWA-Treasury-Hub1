import { createConfig, http } from 'wagmi';
import { baseSepolia, arbitrumSepolia, avalancheFuji, sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [baseSepolia, arbitrumSepolia, avalancheFuji, sepolia],
  connectors: [
    injected(), // Remove target specification to support all injected wallets
  ],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
    [arbitrumSepolia.id]: http('https://sepolia-rollup.arbitrum.io/rpc'),
    [avalancheFuji.id]: http('https://api.avax-test.network/ext/bc/C/rpc'),
    [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com'),
  },
});