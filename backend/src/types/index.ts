// Type definitions
export interface ResearchQuery {
  query: string;
  priority: 'high' | 'medium' | 'low';
  requiredData: ('onchain' | 'market' | 'social' | 'docs')[];
}

export interface ResearchResult {
  source: string;
  data: any;
  confidence: number;
  timestamp: string;
}

export interface Strategy {
  action: string;
  protocol: string;
  amount?: string;
  reasoning: string;
  riskScore: number;
  expectedReturn?: string;
}

export interface SimulationResult {
  success: boolean;
  gasEstimate: string;
  expectedOutcome: any;
  warnings?: string[];
}

export interface ExecutionResult {
  txHash: string;
  status: 'pending' | 'success' | 'failed';
  blockNumber?: number;
}

export interface TransactionParams {
  to: string;
  data: string;
  value: string;
  description: string;
}

export interface StrategyAction {
  action: 'deposit' | 'withdraw' | 'approve';
  amount?: string;
  protocol?: string;
  strategy?: string;
  positionId?: number;
}

export interface AgentResponse {
  response: string;
  requiresApproval: boolean;
  transactions?: TransactionParams[];
  metadata?: {
    strategyAction?: StrategyAction;
    estimatedGas?: string;
    risk?: string;
  };
}
