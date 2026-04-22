---
name: defi-research
description: AI-powered DeFi research and execution skill for BNB Chain. Use when the user asks about DeFi protocols, yields, TVL, perpetual futures, funding rates, or wants to deposit, swap, check portfolio, or buy meme tokens on BNB Chain. Triggers on keywords like 'defi', 'yield', 'protocol', 'tvl', 'deposit', 'swap', 'portfolio', 'perp', 'funding rate', 'PancakeSwap', 'Venus', 'MYX', 'leverage', 'apy'.
---

# DeFi Research & Execution Skill

AI-powered DeFi research agent for BNB Chain, powered by ChainInsight multi-agent system.

## When to use
- User asks about DeFi protocols, yields, or TVL on BNB Chain
- User wants to compare protocols (PancakeSwap, Venus, Alpaca, MYX)
- User asks about perpetual futures, funding rates, or leverage
- User wants to deposit, swap, or manage DeFi positions
- User asks about their portfolio or wallet balance
- User wants to buy tokens on Four.meme

## Tools

### Tool: defi_research
Research DeFi protocols, yields, and market data on BNB Chain.

#### Parameters
- `query` — Natural language question about DeFi (e.g., "What are the top lending protocols on BNB Chain?")

#### Execution
1. Query the ChainInsight backend API for live data:
   ```bash
   curl -X POST "${CHAININSIGHT_API_URL:-http://localhost:3001}/api/query" \
     -H "Content-Type: application/json" \
     -d '{"query": "<user question>"}'
   ```
2. Parse the JSON response — key fields: `response`, `requiresApproval`, `transactions`
3. Present findings to the user in a clear, formatted way
4. If response includes `requiresApproval: true`, show transaction details and ask for confirmation before executing

### Tool: check_portfolio
Check the user's on-chain DeFi positions and wallet balance.

#### Execution
1. Get the agent's wallet address:
   ```bash
   purr wallet address --chain-type ethereum
   ```
2. Check native BNB balance:
   ```bash
   purr wallet balance
   ```
3. For detailed position data, query the ChainInsight API:
   ```bash
   curl -X GET "${CHAININSIGHT_API_URL:-http://localhost:3001}/api/portfolio?address=$(purr wallet address --chain-type ethereum | jq -r '.address')"
   ```

### Tool: execute_swap
Execute a token swap via PancakeSwap on BNB Chain.

#### Parameters
- `from_token` — Source token symbol (e.g., "BNB", "USDC")
- `to_token` — Destination token symbol
- `amount` — Amount to swap

#### Execution
1. **Always** confirm intent with the user before executing.
2. Show the swap preview with estimated output and slippage.
3. Execute:
   ```bash
   purr pancake swap --execute
   ```
4. Return the transaction hash and result summary.

### Tool: execute_deposit
Deposit into a DeFi vault on BNB Chain.

#### Parameters
- `protocol` — Protocol name (e.g., "Lista", "Venus")
- `amount` — Amount to deposit
- `asset` — Asset symbol (e.g., "USDC", "BNB")

#### Execution
1. **Always** confirm intent with the user before executing.
2. List available vaults:
   ```bash
   purr lista list-vaults
   ```
3. Execute deposit:
   ```bash
   purr lista deposit --execute
   ```
4. Return the transaction hash and confirmation.

### Tool: buy_meme_token
Buy tokens on Four.meme launchpad.

#### Parameters
- `token` — Token name or contract address
- `amount` — Amount of BNB to spend

#### Execution
1. **Always** confirm the token and amount with the user.
2. Show token details and risk warnings.
3. Execute:
   ```bash
   purr fourmeme buy --execute
   ```
4. Return the result with transaction details.

### Tool: transfer_tokens
Transfer tokens to another wallet.

#### Parameters
- `to` — Recipient wallet address
- `amount` — Amount to transfer
- `token` — Token symbol (e.g., "BNB", "USDC")

#### Execution
1. **Always** confirm recipient, amount, and token with the user.
2. Execute:
   ```bash
   purr wallet transfer --to <to> --amount <amount> --token <token>
   ```
3. Return the transaction hash.

## Security
- **Always** confirm with user before any on-chain execution
- Use purr's TEE-secured wallet — no private key exposure
- Verify contract addresses before interacting
- Do not exceed daily spending limits
- Show gas estimates before execution
