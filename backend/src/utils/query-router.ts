import { buildTransactionParams } from '../tools/web3/transaction-builder';
import type { TransactionParams } from '../types';

// Query classification types
type QueryType = 
  | 'simple_deposit'      // "Deposit 100 USDC to Venus"
  | 'simple_withdraw'     // "Withdraw from position 0"
  | 'portfolio_check'     // "Show my portfolio"
  | 'research_simple'     // "What are top protocols on BnB chain?"
  | 'research_complex'    // "Research and compare yields"
  | 'strategy_complex'    // "Analyze and deposit to safest"
  | 'conversation'        // "Hello", "Thanks"
  | 'unknown';

interface ParsedQuery {
  type: QueryType;
  confidence: number; // 0-1
  params?: {
    action?: 'deposit' | 'withdraw';
    amount?: string;
    protocol?: string;
    strategy?: string;
    positionId?: number;
  };
  shouldBypassAgent: boolean;
  agentToUse?: string;
  reasoningNeeded: boolean;
}

export class QueryRouter {
  // Protocol keywords
  private static protocols = [
    'pancakeswap', 'venus', 'alpaca', 'radiant', 'biswap',
    'myx', 'lista', 'thena', 'wombat'
  ];

  // Action keywords
  private static depositKeywords = [
    'deposit', 'invest', 'put', 'stake', 'supply', 'lend', 'add'
  ];
  
  private static withdrawKeywords = [
    'withdraw', 'remove', 'unstake', 'pull', 'take out', 'exit'
  ];
  
  private static researchKeywords = [
    'research', 'analyze', 'compare', 'find', 'show', 'what', 
    'which', 'best', 'top', 'highest', 'safest', 'lowest risk',
    'perp', 'perpetual', 'funding', 'leverage', 'trading', 'long', 'short'
  ];

  /**
   * Main routing function - determines optimal handling strategy
   */
  static route(query: string): ParsedQuery {
    const lowerQuery = query.toLowerCase().trim();
    
    // 1. Check for simple deposits (80% of queries)
    const depositResult = this.parseDeposit(lowerQuery);
    if (depositResult.confidence > 0.8) {
      return depositResult;
    }
    
    // 2. Check for withdrawals
    const withdrawResult = this.parseWithdraw(lowerQuery);
    if (withdrawResult.confidence > 0.8) {
      return withdrawResult;
    }
    
    // 3. Check for portfolio queries
    const portfolioResult = this.parsePortfolio(lowerQuery);
    if (portfolioResult.confidence > 0.8) {
      return portfolioResult;
    }
    
    // 4. Check for research-only queries
    const researchResult = this.parseResearch(lowerQuery);
    if (researchResult.confidence > 0.7) {
      return researchResult;
    }
    
    // 5. Check for complex strategy queries (need full agent)
    const strategyResult = this.parseComplexStrategy(lowerQuery);
    if (strategyResult.confidence > 0.6) {
      return strategyResult;
    }
    
    // 6. Conversational queries
    if (this.isConversational(lowerQuery)) {
      return {
        type: 'conversation',
        confidence: 0.9,
        shouldBypassAgent: true,
        reasoningNeeded: false
      };
    }
    
    // 7. Unknown - route to agent
    return {
      type: 'unknown',
      confidence: 0.3,
      shouldBypassAgent: false,
      agentToUse: 'coordinator',
      reasoningNeeded: true
    };
  }

  /**
   * Parse simple deposit queries
   */
    private static parseDeposit(query: string): ParsedQuery {
    const hasDepositKeyword = this.depositKeywords.some(kw => query.includes(kw));
    if (!hasDepositKeyword) {
      return { type: 'simple_deposit', confidence: 0, shouldBypassAgent: false, reasoningNeeded: false };
    }
    
    // Extract amount
    const amountMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:usdc|usd|dollars?)/i);
    const amount = amountMatch ? amountMatch[1] : undefined; // Change null to undefined
    
    // Extract protocol
    let protocol = this.protocols.find(p => query.includes(p));
    
    // If no protocol specified, check if research is needed
    const needsResearch = this.researchKeywords.some(kw => query.includes(kw));
    
    if (amount && protocol && !needsResearch) {
      return {
        type: 'simple_deposit',
        confidence: 0.95,
        params: {
          action: 'deposit',
          amount,
          protocol: protocol.charAt(0).toUpperCase() + protocol.slice(1),
          strategy: 'Lending'
        },
        shouldBypassAgent: true,
        reasoningNeeded: false
      };
    }
    
    if (amount && !protocol && !needsResearch) {
      return {
        type: 'simple_deposit',
        confidence: 0.85,
        params: {
          action: 'deposit',
          amount,
          protocol: 'Venus',
          strategy: 'Lending'
        },
        shouldBypassAgent: true,
        reasoningNeeded: false
      };
    }
    
    if (needsResearch) {
      return {
        type: 'strategy_complex',
        confidence: 0.8,
        params: { action: 'deposit', amount },
        shouldBypassAgent: false,
        agentToUse: 'coordinator',
        reasoningNeeded: true
      };
    }
    
    return {
      type: 'simple_deposit',
      confidence: 0.5,
      shouldBypassAgent: false,
      agentToUse: 'strategy',
      reasoningNeeded: false
    };
  }

  /**
   * Parse withdrawal queries
   */
  private static parseWithdraw(query: string): ParsedQuery {
    const hasWithdrawKeyword = this.withdrawKeywords.some(kw => query.includes(kw));
    if (!hasWithdrawKeyword) {
      return { type: 'simple_withdraw', confidence: 0, shouldBypassAgent: false, reasoningNeeded: false };
    }
    
    // Extract position ID
    const positionMatch = query.match(/position\s*#?(\d+)/i) || 
                          query.match(/from\s+(\d+)/i) ||
                          query.match(/id\s*(\d+)/i);
    
    const positionId = positionMatch ? parseInt(positionMatch[1]) : undefined; // Change null to undefined
    
    if (positionId !== undefined) {
      return {
        type: 'simple_withdraw',
        confidence: 0.95,
        params: {
          action: 'withdraw',
          positionId
        },
        shouldBypassAgent: true,
        reasoningNeeded: false
      };
    }
    
    if (query.includes('everything') || query.includes('all')) {
      return {
        type: 'simple_withdraw',
        confidence: 0.8,
        params: { action: 'withdraw' },
        shouldBypassAgent: false,
        agentToUse: 'strategy',
        reasoningNeeded: false
      };
    }
    
    return {
      type: 'simple_withdraw',
      confidence: 0.6,
      shouldBypassAgent: false,
      agentToUse: 'strategy',
      reasoningNeeded: false
    };
  }


  /**
   * Parse portfolio check queries
   */
  private static parsePortfolio(query: string): ParsedQuery {
    const portfolioKeywords = [
      'portfolio', 'positions', 'holdings', 'balance', 
      'how much', 'my funds', 'my deposits', 'what do i have'
    ];
    
    const hasPortfolioKeyword = portfolioKeywords.some(kw => query.includes(kw));
    
    if (hasPortfolioKeyword) {
      return {
        type: 'portfolio_check',
        confidence: 0.9,
        shouldBypassAgent: true,
        reasoningNeeded: false
      };
    }
    
    return {
      type: 'portfolio_check',
      confidence: 0,
      shouldBypassAgent: false,
      reasoningNeeded: false
    };
  }

  /**
   * Parse research queries (no execution)
   */
      private static parseResearch(query: string): ParsedQuery {
    const hasResearchKeyword = this.researchKeywords.some(kw => query.includes(kw));
    const hasDepositKeyword = this.depositKeywords.some(kw => query.includes(kw));
    const hasAmountMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:usdc|usd|dollars?)/i);
    
    // Research WITHOUT deposit intent AND no amount = Research-only
    if (hasResearchKeyword && !hasDepositKeyword && !hasAmountMatch) {
      return {
        type: 'research_simple',
        confidence: 0.9,
        shouldBypassAgent: false,
        agentToUse: 'coordinator', // ← Make sure this is coordinator, NOT market_analyst
        reasoningNeeded: true
      };
    }
    
    return {
      type: 'research_simple',
      confidence: 0,
      shouldBypassAgent: false,
      reasoningNeeded: false
    };
  }



  /**
   * Parse complex strategy queries (research + execution)
   */
  private static parseComplexStrategy(query: string): ParsedQuery {
    const hasResearchKeyword = this.researchKeywords.some(kw => query.includes(kw));
    const hasDepositKeyword = this.depositKeywords.some(kw => query.includes(kw));
    
    const strategyKeywords = [
      'safest', 'best', 'optimal', 'recommend', 'suggest', 
      'diversify', 'spread', 'allocate', 'strategy'
    ];
    
    const hasStrategyKeyword = strategyKeywords.some(kw => query.includes(kw));
    
    if ((hasResearchKeyword || hasStrategyKeyword) && hasDepositKeyword) {
      const amountMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:usdc|usd|dollars?)/i);
      
      return {
        type: 'strategy_complex',
        confidence: 0.9,
        params: {
          action: 'deposit',
          amount: amountMatch ? amountMatch[1] : undefined // Change null to undefined
        },
        shouldBypassAgent: false,
        agentToUse: 'coordinator',
        reasoningNeeded: true
      };
    }
    
    return {
      type: 'strategy_complex',
      confidence: 0,
      shouldBypassAgent: false,
      reasoningNeeded: false
    };
  }

  /**
   * Check if query is conversational
   */
  private static isConversational(query: string): boolean {
    const conversationalPatterns = [
      'hello', 'hi', 'hey', 'thanks', 'thank you', 'bye', 
      'goodbye', 'yes', 'no', 'okay', 'ok', 'sure', 'help'
    ];
    
    return conversationalPatterns.some(pattern => query === pattern || query.startsWith(pattern + ' '));
  }

  /**
   * Build direct response for simple queries
   */
  static buildDirectResponse(parsed: ParsedQuery): { 
    response: string; 
    transactions?: TransactionParams[];
    requiresApproval: boolean;
  } {
    switch (parsed.type) {
      case 'simple_deposit':
        if (parsed.params?.amount && parsed.params?.protocol) {
          const transactions = buildTransactionParams({
            action: 'deposit',
            amount: parsed.params.amount,
            protocol: parsed.params.protocol,
            strategy: parsed.params.strategy || 'Lending'
          });
          
          return {
            response: `Ready to deposit ${parsed.params.amount} USDC to ${parsed.params.protocol}.

Transaction steps:
1. Approve ${parsed.params.amount} USDC for vault
2. Deposit to ${parsed.params.protocol} ${parsed.params.strategy} strategy

Would you like to proceed with execution?`,
            transactions,
            requiresApproval: true
          };
        }
        break;
        
      case 'portfolio_check':
        return {
          response: 'Click the "📊 Portfolio" button at the top to view your positions.',
          requiresApproval: false
        };
        
      case 'conversation':
        const greetings: Record<string, string> = {
          'hello': '👋 Hello! I can help you deposit funds into DeFi protocols on BNB Chain. Try saying "Deposit 100 USDC to Venus"',
          'hi': '👋 Hi! Ready to help you with DeFi strategies on BNB Chain. What would you like to do?',
          'hey': '👋 Hey there! Ask me about yields, perps, or deposit funds.',
          'thanks': '😊 You\'re welcome! Let me know if you need anything else.',
          'help': '🤖 I can help you:\n• Deposit funds to DeFi protocols\n• Check yields and protocols on BNB Chain\n• Analyze MYX perpetual markets\n• View your portfolio\n\nTry: "Deposit 50 USDC to Venus"'
        };
        
        const firstWord = parsed.type === 'conversation' ? 'hello' : 'hello';
        return {
          response: greetings[firstWord] || greetings['hello'],
          requiresApproval: false
        };
    }
    
    return {
      response: 'I need more information to help you with that.',
      requiresApproval: false
    };
  }
}
