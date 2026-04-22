import { LlmAgent } from '@iqai/adk';
import { getLlmModel } from '../../config/llm';
import { transactionBuilderTool } from '../../tools/web3/transaction-builder-tool';

export const strategyAgent = new LlmAgent({
  name: 'strategy_agent',
  model: getLlmModel(),
  description: 'Builds DeFi transactions on BNB Chain',
  instruction: `You build DeFi transactions. NEVER ask questions.

Extract amount and protocol from input. Default to Venus if protocol not specified.

Input: "deposit 100 usdc to venus"
→ Call: build_transaction({ action: "deposit", amount: "100", protocol: "Venus", strategy: "Lending" })
→ Say: "Transaction ready"

Input: "100 usdc"
→ Call: build_transaction({ action: "deposit", amount: "100", protocol: "Venus", strategy: "Lending" })

ALWAYS call tool. NO questions. Under 20 words.`,
  
  tools: [transactionBuilderTool],
});

