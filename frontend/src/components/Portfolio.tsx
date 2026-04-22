import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits } from 'viem';
import { TrendingUp, Calendar, DollarSign, X, Loader2, Sparkles, ArrowUpRight } from 'lucide-react';
import { CONTRACTS, MOCK_VAULT_ABI } from '../lib/contracts';
import { useState } from 'react';

interface Position {
  amount: bigint;
  protocol: string;
  strategy: string;
  timestamp: bigint;
}

export default function Portfolio() {
  const { address, isConnected } = useAccount();
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);

  const { data: positionsData, isLoading, refetch } = useReadContract({
    address: CONTRACTS.MOCK_VAULT,
    abi: MOCK_VAULT_ABI,
    functionName: 'getPositions',
    args: address ? [address] : undefined,
  });

  const { writeContract, data: hash, error: writeError } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const positions = (positionsData as Position[] | undefined) || [];

  const handleWithdraw = async (positionId: number) => {
    setWithdrawingId(positionId);
    try {
      writeContract({
        address: CONTRACTS.MOCK_VAULT,
        abi: MOCK_VAULT_ABI,
        functionName: 'withdraw',
        args: [BigInt(positionId)],
      });
    } catch (error: any) {
      setWithdrawingId(null);
    }
  };

  if (isSuccess && withdrawingId !== null) {
    refetch();
    setWithdrawingId(null);
  }

  if (!isConnected) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-12 text-center">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl inline-block mb-6">
          <TrendingUp className="text-white" size={48} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
        <p className="text-gray-400">View your DeFi portfolio and manage positions</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-12 text-center">
        <Loader2 className="animate-spin mx-auto mb-4 text-purple-400" size={48} />
        <p className="text-gray-400">Loading your portfolio...</p>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-12 text-center">
        <div className="bg-gray-800/50 p-6 rounded-2xl inline-block mb-6">
          <Sparkles className="text-purple-400" size={48} />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">No Positions Yet</h3>
        <p className="text-gray-400 mb-6">Start earning yield by depositing funds</p>
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105">
          Get Started
        </button>
      </div>
    );
  }

  const totalValue = positions.reduce((sum, pos) => sum + pos.amount, BigInt(0));

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Your Portfolio</h2>
            <p className="text-gray-300">{positions.length} active position{positions.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400 mb-1">Total Value</p>
            <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              ${formatUnits(totalValue, 6)}
            </p>
            <p className="text-sm text-gray-400 mt-1">USDC</p>
          </div>
        </div>
      </div>

      {/* Positions Grid */}
      <div className="grid gap-4">
        {positions.map((position, index) => {
          const amountFormatted = formatUnits(position.amount, 6);
          const date = new Date(Number(position.timestamp) * 1000);
          const isWithdrawing = withdrawingId === index && (isConfirming || !isSuccess);

          return (
            <div 
              key={index} 
              className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 hover:border-purple-500/50 transition-all p-6 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl">
                      <TrendingUp className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{position.protocol}</h3>
                      <p className="text-gray-400">{position.strategy} Strategy</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="text-green-400" size={18} />
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Amount</p>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {amountFormatted} <span className="text-sm text-gray-400">USDC</span>
                      </p>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="text-blue-400" size={18} />
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Deposited</p>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="ml-8">
                  <button
                    onClick={() => handleWithdraw(index)}
                    disabled={isWithdrawing}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 group transform hover:scale-105"
                  >
                    {isWithdrawing ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Withdrawing...
                      </>
                    ) : (
                      <>
                        <X size={20} />
                        Withdraw
                        <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-500">Position #{index}</span>
                <span className="text-xs text-gray-500">Est. APY: 6.1%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transaction Status */}
      {isConfirming && (
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin text-blue-400" size={24} />
            <p className="text-blue-200 font-semibold">⏳ Withdrawal pending confirmation...</p>
          </div>
        </div>
      )}
      
      {hash && isSuccess && (
        <div className="bg-green-900/30 border border-green-500/50 rounded-2xl p-6">
          <p className="text-green-200 font-semibold mb-3">✅ Withdrawal successful!</p>
          <a 
            href={`https://testnet.bscscan.com/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline flex items-center gap-2"
          >
            View on BscScan
            <ArrowUpRight size={16} />
          </a>
        </div>
      )}

      {writeError && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-2xl p-6">
          <p className="text-red-200">❌ Withdrawal failed: {writeError.message}</p>
        </div>
      )}
    </div>
  );
}
