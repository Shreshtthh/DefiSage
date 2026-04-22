/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
import { formatUnits } from 'viem';
import { Send, Loader2, Wallet, AlertCircle, CheckCircle2, ExternalLink, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { api } from '../lib/api';
import { CONTRACTS, MOCK_USDC_ABI, MOCK_VAULT_ABI } from '../lib/contracts';
import Portfolio from './Portfolio';

interface Message {
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
}

interface TransactionParams {
  to: string;
  data: string;
  value: string;
  description: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showApproval, setShowApproval] = useState(false);
  const [pendingTransactions, setPendingTransactions] = useState<TransactionParams[]>([]);
  const [currentTxIndex, setCurrentTxIndex] = useState(0);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'executing' | 'success' | 'error'>('idle');
  const [showPortfolio, setShowPortfolio] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const queryClient = useQueryClient();

  // Auto-switch to BSC Testnet if wallet is on wrong chain
  useEffect(() => {
    if (isConnected && chainId && chainId !== bscTestnet.id) {
      switchChain({ chainId: bscTestnet.id });
    }
  }, [isConnected, chainId]);

  const { data: balanceData, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.MOCK_USDC,
    abi: MOCK_USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { refetchInterval: 4000 },
  });

  const balance = balanceData as bigint | undefined;

  const { writeContract, data: hash, error: writeError, reset: resetWrite } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isConfirmed && hash) {
      const txUrl = `https://testnet.bscscan.com/tx/${hash}`;
      const txDescription = pendingTransactions[currentTxIndex]?.description || 'Transaction';
      
      addMessage('system', `✅ ${txDescription} confirmed!\n\nView on BscScan: ${txUrl}`);
      
      if (currentTxIndex < pendingTransactions.length - 1) {
        const nextIndex = currentTxIndex + 1;
        setCurrentTxIndex(nextIndex);
        // Auto-chain: fire next transaction immediately after confirmation
        setTimeout(() => executeNextTransaction(nextIndex), 500);
      } else {
        setExecutionStatus('success');
        setPendingTransactions([]);
        setCurrentTxIndex(0);
        queryClient.invalidateQueries();
        addMessage('system', '🎉 All transactions completed successfully!');
      }
    }
  }, [isConfirmed, hash]);

  useEffect(() => {
    if (writeError) {
      setExecutionStatus('error');
      const errorMessage = writeError.message.includes('User rejected')
        ? '❌ Transaction rejected by user'
        : `❌ Transaction failed: ${writeError.message}`;
      addMessage('system', errorMessage);
    }
  }, [writeError]);

  const addMessage = (role: 'user' | 'agent' | 'system', content: string) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date() }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const query = input.trim();
    setInput('');
    addMessage('user', query);
    setIsLoading(true);

    try {
      const response = await api.query(query, sessionId || undefined);
      setSessionId(response.sessionId);
      addMessage('agent', response.response);

      if (response.transactions && response.transactions.length > 0) {
        setPendingTransactions(response.transactions);
      }

      if (response.requiresApproval) {
        setShowApproval(true);
      }
    } catch (error: any) {
      addMessage('system', `❌ Error: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMint = async () => {
    if (!isConnected || !address) return;
    try {
      addMessage('system', '⏳ Minting 1000 mUSDC...');
      writeContract({
        chainId: bscTestnet.id,
        address: CONTRACTS.MOCK_USDC,
        abi: MOCK_USDC_ABI,
        functionName: 'mint',
        args: [BigInt(1000 * 10 ** 6)],
      });
    } catch (error: any) {
      addMessage('system', `❌ Mint failed: ${error.message}`);
    }
  };

  const executeNextTransaction = async (txIndex: number) => {
    if (txIndex >= pendingTransactions.length) return;

    const tx = pendingTransactions[txIndex];
    addMessage('system', `⏳ Step ${txIndex + 1}/${pendingTransactions.length}: ${tx.description}`);

    try {
      resetWrite();
      
      if (tx.description.includes('Approve')) {
        const amount = tx.description.match(/(\d+)/)?.[0] || '100';
        writeContract({
          chainId: bscTestnet.id,
          address: CONTRACTS.MOCK_USDC,
          abi: MOCK_USDC_ABI,
          functionName: 'approve',
          args: [CONTRACTS.MOCK_VAULT, BigInt(amount) * BigInt(10 ** 6)],
        });
      } else if (tx.description.includes('Deposit')) {
        const amount = tx.description.match(/(\d+)/)?.[0] || '100';
        const protocol = tx.description.match(/to (\w+)/)?.[1] || 'Venus';
        writeContract({
          chainId: bscTestnet.id,
          address: CONTRACTS.MOCK_VAULT,
          abi: MOCK_VAULT_ABI,
          functionName: 'deposit',
          args: [BigInt(amount) * BigInt(10 ** 6), protocol, 'Lending'],
        });
      }
    } catch (error: any) {
      setExecutionStatus('error');
      addMessage('system', `❌ Transaction failed: ${error.message}`);
    }
  };

  const handleApprove = async () => {
    if (!sessionId || !isConnected || !address) return;
    
    setShowApproval(false);
    setIsLoading(true);
    addMessage('user', '✅ Approved execution');

    try {
      const response = await api.approve(sessionId, true);
      const transactions = response.transactions || pendingTransactions;
      
      if (!transactions || transactions.length === 0) {
        addMessage('system', '⚠️ No transactions found');
        setIsLoading(false);
        return;
      }

      setPendingTransactions(transactions);
      setCurrentTxIndex(0);
      setExecutionStatus('executing');
      executeNextTransaction(0);
    } catch (error: any) {
      addMessage('system', `❌ Approval failed: ${error.message}`);
      setExecutionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = () => {
    setShowApproval(false);
    setPendingTransactions([]);
    setExecutionStatus('idle');
    addMessage('user', '❌ Rejected execution');
    addMessage('agent', 'Execution cancelled. How else can I help you?');
  };

  const suggestedQueries = [
    { icon: <TrendingUp size={16} />, text: "What are the top DeFi protocols on BNB Chain?" },
    { icon: <Zap size={16} />, text: "Show MYX perpetual funding rates" },
    { icon: <Sparkles size={16} />, text: "Deposit 100 USDC to Venus" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">DefiSage</h1>
                <p className="text-sm text-gray-400">AI-Powered DeFi Research Agent</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isConnected && (
                <>
                  <button
                    onClick={() => setShowPortfolio(!showPortfolio)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all transform hover:scale-105"
                  >
                    {showPortfolio ? '💬 Chat' : '📊 Portfolio'}
                  </button>

                  {balance !== undefined && (
                    <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
                      <div className="text-xs text-gray-400">Balance</div>
                      <div className="text-sm font-bold text-white">
                        {formatUnits(balance, 6)} <span className="text-gray-400">mUSDC</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleMint}
                    disabled={isConfirming}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                  >
                    🎁 Mint
                  </button>
                </>
              )}

              {!isConnected ? (
                <button
                  onClick={() => connect({ connector: connectors[0] })}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  <Wallet size={20} />
                  Connect Wallet
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-300 bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                  <button
                    onClick={() => disconnect()}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-all"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {showPortfolio ? (
          <Portfolio />
        ) : (
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 shadow-2xl">
            {/* Chat Messages */}
            <div className="h-[600px] overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl mb-6">
                    <Sparkles className="text-white" size={48} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome to DefiSage</h2>
                  <p className="text-gray-400 mb-8 max-w-md">
                    Your AI-powered DeFi research assistant. Ask me anything about protocols, yields, and strategies.
                  </p>
                  <div className="space-y-3 w-full max-w-md">
                    {suggestedQueries.map((query, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInput(query.text)}
                        className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all flex items-center gap-3 group"
                      >
                        <span className="text-purple-400">{query.icon}</span>
                        <span className="text-sm">{query.text}</span>
                        <Send size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-5 py-4 ${msg.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : msg.role === 'system'
                            ? 'bg-blue-900/30 text-blue-200 border border-blue-700/50'
                            : 'bg-gray-800 text-gray-100 border border-gray-700'
                        }`}>
                        {msg.role === 'agent' && (
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
                            <Sparkles size={16} className="text-purple-400" />
                            <span className="text-xs font-semibold text-gray-400">DefiSage AI</span>
                          </div>
                        )}
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{msg.content}</pre>
                        {msg.content.includes('bscscan.com') && (
                          <a
                            href={msg.content.match(/https:\/\/[^\s]+/)?.[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-3 text-blue-400 hover:text-blue-300 underline text-sm"
                          >
                            <ExternalLink size={14} />
                            View Transaction
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800 border border-gray-700 rounded-2xl px-5 py-4 flex items-center gap-3">
                        <Loader2 className="animate-spin text-purple-400" size={20} />
                        <span className="text-sm text-gray-300">Thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Approval Modal */}
            {showApproval && (
              <div className="mx-6 mb-4 bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-2 border-amber-600/50 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="text-amber-400 mt-1 flex-shrink-0" size={24} />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-amber-200 mb-2">⚠️ Approval Required</h3>
                    <p className="text-amber-100/80 mb-4">
                      Ready to execute {pendingTransactions.length} transaction(s). Review and approve to continue.
                    </p>

                    <div className="bg-gray-900/50 rounded-xl p-4 mb-4 border border-gray-700">
                      <p className="text-sm font-semibold text-gray-300 mb-3">Transaction Steps:</p>
                      <ol className="space-y-2">
                        {pendingTransactions.map((tx, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                            <span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </span>
                            <span>{tx.description}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleApprove}
                        disabled={!isConnected || isLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={20} />
                        Approve & Execute
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={isLoading}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-6 border-t border-gray-800">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about DeFi protocols, yields, or strategies..."
                  className="flex-1 px-5 py-4 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white placeholder-gray-500 transition-all"
                  disabled={isLoading || executionStatus === 'executing'}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim() || executionStatus === 'executing'}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
