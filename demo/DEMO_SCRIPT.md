# 🎬 DefiSage Demo Script

> Complete script for recording the Four.meme AI Sprint hackathon demo video.  
> **Target Duration:** 3–5 minutes  
> **Tip:** Practice once before recording. Have two terminals and the browser ready.

---

## 📋 Pre-Demo Checklist

- [ ] Backend running (`cd backend && npm run server`)
- [ ] Frontend running (`cd frontend && npm run dev`)
- [ ] MetaMask connected to BSC Testnet
- [ ] Browser open at `http://localhost:3000`
- [ ] Terminal visible for backend logs
- [ ] Screen recorder running

---

## Scene 1: Introduction (30 seconds)

**[Show: Browser with DefiSage UI]**

> *"Hi, I'm Shreshth, and this is DefiSage — an AI-powered multi-agent DeFi research and execution system built on BNB Chain."*

> *"The DeFi landscape is fragmented. Users jump between DeFiLlama for TVL, protocol UIs for yields, block explorers for analytics, and separate DEX interfaces for perpetual trading. DefiSage unifies all of this into a single conversational AI."*

> *"Let me show you how it works."*

---

## Scene 2: DeFi Research — DeFiLlama Integration (45 seconds)

**[Show: Chat interface]**

### Type in chat:
```
What are the top DeFi protocols on BNB Chain?
```

**[Wait for response — show loading, then results]**

> *"I asked a simple question in natural language. Behind the scenes, the Coordinator agent classified this as a research query, delegated it to the Market Analyst agent, which queried DeFiLlama's API for live TVL data, then synthesized a clear response."*

> *"You can see real protocols like PancakeSwap, Venus, and Lista with their actual TVL numbers — this is live data, not hardcoded."*

**[Point to terminal logs showing agent flow]**

---

## Scene 3: MYX Finance Perpetuals — MYX Bounty (45 seconds)

**[Show: Chat interface]**

### Type in chat:
```
Show me MYX Finance perpetual funding rates
```

**[Wait for response]**

> *"For the MYX Finance bounty, we integrated their perpetual futures API. The agent fetches real-time data — available trading pairs, funding rates, maximum leverage, and market addresses."*

> *"This enables traders to ask natural language questions about perpetual markets instead of navigating complex DEX interfaces."*

---

## Scene 4: DGrid AI Gateway Fallback — DGrid Bounty (45 seconds)

**[Show: Terminal + Chat]**

> *"For the DGrid bounty, we integrated DGrid as our AI Gateway. Let me demonstrate the fallback mechanism."*

### Show the curl command in terminal:
```bash
curl -X POST http://localhost:3001/api/dgrid \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Analyze Venus Protocol lending on BNB Chain"}'
```

**[Show response]**

> *"This is a direct call to DGrid's unified LLM gateway. But more importantly, DGrid is integrated as an automatic fallback in our agent pipeline."*

> *"When Google's Gemini API is unavailable — which happens during peak traffic — our system automatically fails over to DGrid. The user gets a response regardless. This is how production AI systems should handle LLM reliability."*

**[Show the fallback code or terminal log showing `🔄 Falling back to DGrid AI Gateway...` if available]**

---

## Scene 5: Transaction Execution (60 seconds)

**[Show: Chat interface + MetaMask]**

### Type in chat:
```
Deposit 100 USDC to Venus
```

**[Wait for response with transaction details]**

> *"Now let's do something more powerful — a DeFi transaction. I asked to deposit USDC into Venus."*

> *"The Strategy Agent built the transaction parameters. The Simulation Agent verified gas costs and balance. Now it's waiting for my explicit approval — no transaction executes without user consent."*

**[Click Approve if available]**

> *"The system uses our deployed MockUSDC contract at `0x3B38...` and MockVault at `0xAcfE...` on BSC Testnet. You can verify these on BscScan."*

**[Show BscScan link if time permits]**

---

## Scene 6: Pieverse Skill — Pieverse Bounty (30 seconds)

**[Show: SKILL.md file or Pieverse Skill Store page]**

> *"Finally, for the Pieverse bounty, we packaged DefiSage as an installable skill for Purrfect Claw agents."*

> *"Any Purrfect Claw agent can install this skill and gain the ability to research DeFi protocols, execute swaps on PancakeSwap, deposit into Venus or Lista, and even buy tokens on Four.meme — all using TEE-secured wallets where private keys never leave the Trusted Execution Environment."*

**[Show SKILL.md with tool definitions]**

---

## Scene 7: Architecture Recap & Closing (30 seconds)

**[Show: README architecture diagram or slides]**

> *"To summarize — DefiSage is a multi-agent AI system with 6 specialized agents, integrated with DeFiLlama, MYX Finance, CoinGecko, and BscScan. It uses Gemini as the primary LLM with DGrid as a reliability fallback, deployed on BSC Testnet, and published as a Pieverse skill."*

> *"All built in TypeScript with ADK-TS, targeting 4 bounty tracks for the Four.meme AI Sprint. Thank you!"*

---

## 🎯 Key Points to Emphasize

### For Judges
1. **Multi-agent architecture** — Not just one LLM call. 6 specialized agents with distinct roles.
2. **Live data** — Every response uses real API data, not mock or hardcoded responses.
3. **Transaction safety** — Simulate → Approve → Execute pipeline.
4. **DGrid reliability** — Production-grade fallback pattern.
5. **Deployed contracts** — Real smart contracts on BSC Testnet.

### Bounty Highlights
| Track | Key Demonstration |
|-------|-------------------|
| **Main Track** | Full multi-agent flow with live DeFi research + execution |
| **MYX Finance** | Real-time perp data retrieval in natural language |
| **DGrid** | Automatic LLM fallback + dedicated `/api/dgrid` endpoint |
| **Pieverse** | Published SKILL.md with TEE wallet tools |

---

## 🛑 Troubleshooting During Demo

| Issue | Quick Fix |
|-------|-----------|
| Gemini 503 error | Say *"The DGrid fallback will handle this"* — it shows the resilience |
| Slow response | Say *"The agent is coordinating across multiple data sources"* |
| Empty DeFi data | Pre-test the query, or use a simpler query like *"Tell me about PancakeSwap"* |
| MetaMask not connected | Skip transaction demo, focus on research + DGrid |

---

## 📝 Backup Queries

If a query fails, try these reliable alternatives:

```
Tell me about PancakeSwap on BNB Chain
```
```
What is Venus Protocol?
```
```
Compare lending protocols on BNB
```
```
Hello, what can you help me with?
```
