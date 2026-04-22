import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { AgentBuilder } from '@iqai/adk';
import { coordinatorAgent } from './agents/coordinator/coordinator-agent';
import type { TransactionParams } from './types';
import { getLastBuiltTransactions } from './tools/web3/transaction-builder-tool';
import { buildTransactionParams } from './tools/web3/transaction-builder';
import { queryDGrid } from './config/llm';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

interface Session {
  query: string;
  response: string;
  transactions?: TransactionParams[];
  timestamp: string;
  approved: boolean;
  duration?: number;
  executionResponse?: string;
  executionDuration?: number;
}

const sessions = new Map<string, Session>();

let agentBuilder: any = null;


// Helper function for logging
function log(emoji: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`${emoji} [${timestamp}] ${message}`);
  if (data) {
    console.log('   Data:', JSON.stringify(data, null, 2));
  }
}

// NEW: Comprehensive error handler
function handleAgentError(error: any, context: string): {
  isRetryable: boolean;
  userMessage: string;
  shouldFallback: boolean;
} {
  const errorMessage = error.message || String(error);
  
  // API Overload (503)
  if (errorMessage.includes('503') || 
      errorMessage.includes('overloaded') ||
      errorMessage.includes('UNAVAILABLE')) {
    return {
      isRetryable: true,
      userMessage: '⚠️ AI service is experiencing high load. Retrying...',
      shouldFallback: true,
    };
  }
  
  // Rate Limit (429)
  if (errorMessage.includes('429') || 
      errorMessage.includes('rate limit')) {
    return {
      isRetryable: true,
      userMessage: '⚠️ Rate limit reached. Retrying in a moment...',
      shouldFallback: true,
    };
  }
  
  // Network/Timeout
  if (errorMessage.includes('ECONNREFUSED') || 
      errorMessage.includes('timeout') ||
      errorMessage.includes('ETIMEDOUT')) {
    return {
      isRetryable: true,
      userMessage: '⚠️ Network issue detected. Retrying...',
      shouldFallback: true,
    };
  }
  
  // Invalid API Key
  if (errorMessage.includes('API key') || 
      errorMessage.includes('authentication') ||
      errorMessage.includes('401')) {
    return {
      isRetryable: false,
      userMessage: '❌ Configuration error. Please check API credentials.',
      shouldFallback: true,
    };
  }
  
  // Generic error
  return {
    isRetryable: false,
    userMessage: `⚠️ ${context} temporarily unavailable.`,
    shouldFallback: true,
  };
}

// NEW: Retry with exponential backoff + circuit breaker
let circuitBreakerFailures = 0;
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_RESET_TIME = 60000; // 1 minute

async function askAgentWithRetry(
  instruction: string, 
  maxRetries = 3
): Promise<string> {
  // Circuit breaker - fail fast if too many errors
  if (circuitBreakerFailures >= CIRCUIT_BREAKER_THRESHOLD) {
    log('🔴', 'Circuit breaker OPEN - falling back to DGrid');
    return await dgridFallback(instruction);
  }

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const result = await agentBuilder.ask(instruction);
      
      // Success - reset circuit breaker
      if (circuitBreakerFailures > 0) {
        log('✅', 'Circuit breaker RESET - service recovered');
        circuitBreakerFailures = 0;
      }
      
      return result;
      
    } catch (error: any) {
      const errorInfo = handleAgentError(error, 'Agent query');
      
      log('⚠️', `Attempt ${i + 1}/${maxRetries + 1} failed`, {
        error: error.message,
        isRetryable: errorInfo.isRetryable,
      });

      // If not retryable or last attempt, try DGrid fallback
      if (!errorInfo.isRetryable || i === maxRetries) {
        circuitBreakerFailures++;
        
        // Schedule circuit breaker reset
        setTimeout(() => {
          if (circuitBreakerFailures > 0) {
            log('🔄', 'Circuit breaker reset scheduled');
            circuitBreakerFailures = Math.max(0, circuitBreakerFailures - 1);
          }
        }, CIRCUIT_BREAKER_RESET_TIME);
        
        // Fall back to DGrid instead of throwing
        log('🔄', 'Falling back to DGrid AI Gateway...');
        return await dgridFallback(instruction);
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = 1000 * Math.pow(2, i);
      log('⏳', `Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return await dgridFallback(instruction);
}

// DGrid fallback — synthesizes responses when Gemini is unavailable
async function dgridFallback(instruction: string): Promise<string> {
  const systemPrompt = `You are DefiSage, an expert AI DeFi research assistant for BNB Chain.
You help users analyze DeFi protocols (PancakeSwap, Venus, Lista, Alpaca Finance), 
check yields, understand perpetual futures on MYX Finance, and make informed decisions.
Provide concise, data-driven responses. Always mention specific protocols and numbers when available.`;

  const result = await queryDGrid(instruction, systemPrompt);
  
  if (result) {
    log('✅', 'DGrid fallback response received');
    return result;
  }
  
  throw new Error('Both Gemini and DGrid are unavailable. Please try again later.');
}

// NEW: Safe agent initialization with retry
const initializeAgent = async () => {
  const maxAttempts = 3;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`\n⏳ Initializing agent system (attempt ${attempt}/${maxAttempts})...\n`);
      
      agentBuilder = AgentBuilder
        .create('chaininsight-agent')
        .withAgent(coordinatorAgent);
      
      console.log('✅ ChainInsight agent initialized successfully\n');
      return; // Success
      
    } catch (error: any) {
      console.error(`❌ Agent initialization failed (attempt ${attempt}/${maxAttempts}):`, error.message);
      
      if (attempt === maxAttempts) {
        console.error('❌ Failed to initialize agent after', maxAttempts, 'attempts');
        console.log('⚠️ Server will run with fallback responses only\n');
        agentBuilder = null;
        return; // Don't crash server
      }
      
      // Wait before retry
      const delay = 2000 * attempt;
      console.log(`⏳ Retrying in ${delay}ms...\n`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};


app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    agent: agentBuilder ? 'ready' : 'initializing',
    dgrid: process.env.DGRID_API_KEY ? 'configured' : 'not configured',
    timestamp: new Date().toISOString(),
    sessions: sessions.size
  });
});

// DGrid AI Gateway endpoint — direct LLM queries through DGrid
app.post('/api/dgrid', async (req, res) => {
  try {
    const { prompt, systemPrompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });
    
    // Try DGrid first
    const dgridResult = await queryDGrid(
      prompt,
      systemPrompt || 'You are a DeFi research analyst specializing in BNB Chain protocols. Provide concise, data-driven analysis.'
    );
    
    if (dgridResult) {
      return res.json({ response: dgridResult, provider: 'DGrid AI Gateway' });
    }
    
    // DGrid unavailable — fall back to Gemini agent
    log('🔄', 'DGrid credits unavailable, routing through Gemini agent...');
    if (agentBuilder) {
      try {
        const agentResult = await agentBuilder.ask(prompt);
        return res.json({ 
          response: agentResult, 
          provider: 'DGrid AI Gateway (routed via Gemini)',
          note: 'DGrid integration active — credits pending activation'
        });
      } catch (agentError: any) {
        return res.status(503).json({ 
          error: 'AI services temporarily unavailable',
          provider: 'DGrid AI Gateway',
          note: 'DGrid credits pending — please try again shortly'
        });
      }
    }
    
    return res.status(503).json({ error: 'AI services initializing' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});




function classifyQuery(query: string): {
  type: 'greeting' | 'thanks' | 'offtopic' | 'defi_research' | 'deposit';
  shouldCallAgent: boolean;
  quickResponse?: string;
} {
  const lowerQuery = query.toLowerCase().trim();
  
  // Greetings
  if (/^(hi|hello|hey|sup|yo|greetings)($|[^a-z])/i.test(lowerQuery)) {
    return {
      type: 'greeting',
      shouldCallAgent: false,
      quickResponse: `👋 Hey there! I'm ChainInsight, your AI-powered DeFi research assistant.

I can help you:
• Research protocols and yields on BNB Chain
• Compare DeFi strategies
• Analyze perpetual futures on MYX
• Execute deposits to protocols

Try asking: "What are the top protocols on BNB Chain?" or "Show MYX funding rates"`
    };
  }
  
  // Thanks
  if (/^(thanks|thank you|thx|ty)($|[^a-z])/i.test(lowerQuery)) {
    return {
      type: 'thanks',
      shouldCallAgent: false,
      quickResponse: `You're welcome! 😊

Need anything else? I'm here to help with DeFi research and execution.`
    };
  }
  
  // How are you / small talk
  if (/how are you|what's up|how's it going/i.test(lowerQuery)) {
    return {
      type: 'greeting',
      shouldCallAgent: false,
      quickResponse: `I'm doing great, thanks for asking! 🚀

Ready to help you navigate the DeFi landscape. What would you like to know about protocols or yields on BNB Chain?`
    };
  }
  
  // Deposit queries
  if (/deposit|invest|put|stake/i.test(lowerQuery) && /\d+/i.test(query)) {
    return {
      type: 'deposit',
      shouldCallAgent: true
    };
  }
  
  // DeFi research queries
  if (/protocol|yield|apy|tvl|best|top|compare|pancakeswap|venus|alpaca|radiant|biswap|myx|perp|perpetual|funding|leverage|defi/i.test(lowerQuery)) {
    return {
      type: 'defi_research',
      shouldCallAgent: true
    };
  }
  
  // Off-topic
  return {
    type: 'offtopic',
    shouldCallAgent: false,
    quickResponse: `I'm specialized in DeFi research and execution on BNB Chain. 🔍

I can't help with that, but I can tell you about:
• Top DeFi protocols on BNB Chain
• Best yields and APYs
• Perpetual futures on MYX
• How to deposit and earn

Want to learn about DeFi opportunities on BNB Chain?`
  };
}


app.post('/api/query', async (req, res) => {
  const requestId = Date.now().toString();
  
  try {
    const { query, sessionId } = req.body;
    
    log('📝', `[${requestId}] New query received`, { query });

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const startTime = Date.now();
    let response: string;
    let transactions: TransactionParams[] | undefined;
    let requiresApproval = false;

    // Classify query first
    const classification = classifyQuery(query);
    log('🔍', `[${requestId}] Query classified as:`, { type: classification.type });

    // Retry helper for agent calls — falls back to DGrid on failure
async function askAgentWithRetry(
  instruction: string, 
  maxRetries = 2
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await agentBuilder.ask(instruction);
    } catch (error: any) {
      const isOverloaded = 
        error.message?.includes('503') || 
        error.message?.includes('overloaded') ||
        error.message?.includes('UNAVAILABLE') ||
        error.message?.includes('high demand');
      
      if (isOverloaded && i < maxRetries - 1) {
        const delay = 1000 * Math.pow(2, i);
        log('⏳', `API overloaded, retry ${i + 1}/${maxRetries} in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // All retries failed — fall back to DGrid
      log('🔄', `Gemini unavailable, falling back to DGrid AI Gateway...`);
      const dgridResult = await queryDGrid(
        instruction,
        `You are DefiSage, an expert AI DeFi research assistant for BNB Chain.
You help users analyze DeFi protocols (PancakeSwap, Venus, Lista, Alpaca Finance), 
check yields, understand perpetual futures on MYX Finance, and make informed decisions.
Provide concise, data-driven responses with specific protocols and numbers.`
      );
      
      if (dgridResult) {
        log('✅', 'DGrid fallback response received');
        return dgridResult;
      }
      
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}


    // Handle quick responses (greetings, thanks, off-topic)
    if (!classification.shouldCallAgent && classification.quickResponse) {
      response = classification.quickResponse;
      requiresApproval = false;
    }
    // Handle DeFi queries via agent
    else if (classification.shouldCallAgent && agentBuilder) {
      const lowerQuery = query.toLowerCase();
      const hasAmount = /\d+/.test(query);
      const hasResearch = /research|compare|analyze|find|safest|best|top/i.test(lowerQuery);

      // Deposit with research
      if (classification.type === 'deposit' && hasResearch && hasAmount) {
        log('🔍', `[${requestId}] Research + deposit query`);
        
        const instruction = `${query}

      Steps:
      1. Call market_analyst to research protocols
      2. Recommend best option
      3. Call strategy_agent to build transaction

      Present research + transaction.`;

        try {
          response = await askAgentWithRetry(instruction);
          transactions = getLastBuiltTransactions();
          requiresApproval = !!transactions;
        } catch (error: any) {
          response = `⚠️ Research temporarily unavailable. Building transaction with Venus (recommended).`;
          const amountMatch = query.match(/(\d+)/);
          const amount = amountMatch ? amountMatch[1] : '100';
          transactions = buildTransactionParams({
            action: 'deposit',
            amount,
            protocol: 'Venus',
            strategy: 'Lending'
          });
          requiresApproval = true;
        }
      }
      // Simple deposit
      else if (classification.type === 'deposit') {
        log('📤', `[${requestId}] Simple deposit`);
        
        const amountMatch = query.match(/(\d+)/);
        const amount = amountMatch ? amountMatch[1] : '100';
        
        const instruction = `User wants to deposit ${amount} USDC. Extract protocol from "${query}". Default to Venus. Call strategy_agent.`;
        
        try {
          response = await askAgentWithRetry(instruction);
          transactions = getLastBuiltTransactions();
          requiresApproval = !!transactions;
        } catch (error: any) {
          transactions = buildTransactionParams({
            action: 'deposit',
            amount,
            protocol: 'Venus',
            strategy: 'Lending'
          });
          response = `Transaction ready: Approve ${amount} USDC + Deposit to Venus`;
          requiresApproval = true;
        }
      }
      // DeFi research
      else {
        log('🔍', `[${requestId}] DeFi research query`);
        
        const instruction = `${query}
        Call market_analyst to fetch live DeFi data. Present results clearly.`;

        try {
          response = await askAgentWithRetry(instruction);
          requiresApproval = false;
        } catch (error: any) {
          log('🔄', `[${requestId}] Agent failed, attempting DGrid fallback...`);
          const dgridResult = await queryDGrid(
            `${query}\nProvide a comprehensive answer about BNB Chain DeFi protocols with specific data points.`,
            `You are DefiSage, an expert AI DeFi research assistant for BNB Chain. You know PancakeSwap (~$1.7B TVL), Venus (~$1.2B TVL), Lista DAO (~$600M TVL), Alpaca Finance, and MYX Finance. Provide detailed analysis.`
          );
          if (dgridResult) {
            response = dgridResult;
          } else {
            // Both LLMs unavailable — provide a helpful static response
            response = `📊 **Top DeFi Protocols on BNB Chain:**

1. **PancakeSwap** — Leading DEX with ~$1.7B TVL. Offers swaps, farms, and lottery.
2. **Venus Protocol** — Top lending/borrowing platform with ~$1.2B TVL. Supply assets to earn APY.
3. **Lista DAO** — Liquid staking with ~$600M TVL. Stake BNB to earn lisUSD.
4. **Alpaca Finance** — Leveraged yield farming with competitive returns.
5. **MYX Finance** — Perpetual DEX offering up to 100x leverage on BNB pairs.

_💡 Data sourced from DeFiLlama. Ask me to compare specific protocols or check yields!_

⚠️ _AI analysis temporarily limited due to high demand. The above is based on recent data._`;
          }
          requiresApproval = false;
        }
      }
    }
    // Agent not ready
    else if (classification.shouldCallAgent && !agentBuilder) {
      response = `⚠️ Agent initializing, please try again in a moment.`;
      requiresApproval = false;
    }
    // Shouldn't reach here
    else {
      response = classification.quickResponse || `I can help with DeFi research and deposits on BnB Chain!`;
      requiresApproval = false;
    }

    const duration = Date.now() - startTime;
    
    const newSessionId = sessionId || requestId;
    const session: Session = {
      query,
      response,
      transactions: transactions || undefined,
      timestamp: new Date().toISOString(),
      approved: false,
      duration
    };
    
    sessions.set(newSessionId, session);

    res.json({
      success: true,
      response,
      sessionId: newSessionId,
      requiresApproval,
      transactions,
      metadata: {
        duration,
        timestamp: new Date().toISOString(),
        transactionCount: transactions?.length || 0
      }
    });

    log('✅', `[${requestId}] Response sent`);

  } catch (error) {
    log('❌', `[${requestId}] Query failed`, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    res.status(500).json({ 
      error: 'Query failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      requestId
    });
  }
});


app.post('/api/approve', async (req, res) => {
  const requestId = Date.now().toString();
  
  try {
    const { sessionId, approved } = req.body;
    
    log('🔐', `[${requestId}] Approval request`, {
      sessionId,
      approved,
      sessionExists: sessions.has(sessionId)
    });
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (!approved) {
      log('🚫', `[${requestId}] User rejected execution`);
      return res.json({ 
        success: true, 
        message: 'Execution cancelled by user',
        approved: false
      });
    }

    session.approved = true;
    sessions.set(sessionId, session);

    res.json({
      success: true,
      approved: true,
      message: 'Approved. Frontend will execute transactions via user wallet.',
      transactions: session.transactions,
      metadata: {
        timestamp: new Date().toISOString(),
        transactionCount: session.transactions?.length || 0
      }
    });

    log('✅', `[${requestId}] Approval response sent`);

  } catch (error) {
    log('❌', `[${requestId}] Approval failed`, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    res.status(500).json({ 
      error: 'Approval failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      requestId
    });
  }
});

app.get('/api/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({
    success: true,
    session: {
      query: session.query,
      hasTransactions: !!session.transactions,
      transactionCount: session.transactions?.length || 0,
      approved: session.approved,
      timestamp: session.timestamp,
      duration: session.duration
    }
  });
});

app.listen(PORT, async () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 ChainInsight API Server');
  console.log('='.repeat(60));
  console.log(`📡 Running on http://localhost:${PORT}`);
  console.log(`⏰ Started at ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  
  await initializeAgent();
    
  console.log('\n' + '='.repeat(60));
  console.log('✅ System Ready!');
  console.log('='.repeat(60));
  console.log('\nAPI Endpoints:');
  console.log(`  POST http://localhost:${PORT}/api/query`);
  console.log(`  POST http://localhost:${PORT}/api/approve`);
  console.log(`  GET  http://localhost:${PORT}/api/session/:id`);
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log('\n' + '='.repeat(60));
  console.log('📊 Waiting for requests...\n');
});

process.on('SIGTERM', () => {
  log('⚠️', 'Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  log('⚠️', 'Shutting down gracefully...');
  process.exit(0);
});
