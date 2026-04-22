import { FunctionTool, ToolContext } from '@iqai/adk';
import { ethers } from 'ethers';

/**
 * Execute transaction on testnet
 */
async function executeTransaction(
  params: {
    to: string;
    data?: string;
    value?: string;
    userApproved: boolean;
  },
  toolContext: ToolContext
) {
  if (!params.userApproved) {
    return {
      success: false,
      error: 'Transaction requires user approval. Please confirm before execution.'
    };
  }

  try {
    const provider = new ethers.JsonRpcProvider(process.env.BSC_TESTNET_RPC || 'https://data-seed-prebsc-1-s1.bnbchain.org:8545');
    const wallet = new ethers.Wallet(process.env.TESTNET_PRIVATE_KEY!, provider);

    const tx = await wallet.sendTransaction({
      to: params.to,
      data: params.data || '0x',
      value: params.value ? ethers.parseEther(params.value) : 0n
    });

    // Wait for confirmation
    const receipt = await tx.wait();

    const result = {
      success: true,
      txHash: tx.hash,
      blockNumber: receipt?.blockNumber,
      status: receipt?.status === 1 ? 'success' : 'failed',
      explorer: `https://testnet.bscscan.com/tx/${tx.hash}`
    };

    // Save to state
    toolContext.state.lastTransaction = result;
    toolContext.state.transactionHistory = [
      ...(toolContext.state.transactionHistory || []),
      result
    ];

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Execution failed'
    };
  }
}

export const transactionExecutorTool = new FunctionTool(executeTransaction, {
  name: 'execute_transaction',
  description: 'Execute approved transaction on BSC Testnet. Requires user approval.'
});
