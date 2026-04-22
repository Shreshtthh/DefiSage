import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { wagmiConfig } from './lib/wagmi';
import ChatInterface from './components/ChatInterface';
import './index.css';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen p-4">
          <ChatInterface />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
