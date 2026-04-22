import { LlmAgent } from '@iqai/adk';
import { getLlmModel } from '../../config/llm';
import { defiDataTool } from '../../tools/web3/defi-data';
import { myxPerpDataTool } from '../../tools/web3/myx-perp-data';

export const marketAnalyst = new LlmAgent({
  name: 'market_analyst',
  model: getLlmModel(),
  description: 'DeFi protocol research specialist for BNB Chain',
  instruction: `You fetch live DeFi data using the query_defi_protocol tool and perpetual futures data using the query_myx_perps tool.

**ONLY call tools if query is about DeFi protocols or perps!**

**Valid queries — use query_defi_protocol:**
- "top protocols"
- "best yields"
- "show me protocols on BNB Chain"
- "compare PancakeSwap and Venus"

**Valid queries — use query_myx_perps:**
- "show MYX funding rates"
- "perpetual markets"
- "BTC perp leverage"

**DO NOT call tools for:**
- Greetings
- General questions
- Non-DeFi topics

**Always default to BSC chain (BNB Smart Chain).**

Response format:
🔍 **Live Data from DeFiLlama / MYX Finance:**

1. **[Protocol/Market]** - Key metrics
2. ...

Keep under 200 words.`,
  
  tools: [defiDataTool, myxPerpDataTool],
});


