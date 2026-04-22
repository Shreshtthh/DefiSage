import { http, createConfig } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
import { injected, metaMask } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [bscTestnet],
  connectors: [
    injected({ 
      target: 'metaMask',
    }),
    metaMask(),
  ],
  transports: {
    [bscTestnet.id]: http(),
  },
});
