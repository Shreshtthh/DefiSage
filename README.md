# 🧠 DefiSage — AI-Powered Multi-Agent DeFi Research & Execution on BNB Chain

> **DefiSage** is a multi-agent AI system that researches, analyzes, and executes DeFi strategies on BNB Chain through natural language. Ask a question, get live data, and execute transactions — all in one conversational interface.

> Built for the **[Four.meme AI Sprint Hackathon](https://dorahacks.io/hackathon/four-meme-ai-sprint)**

![BNB Chain](https://img.shields.io/badge/BNB_Chain-F0B90B?style=for-the-badge&logo=binance&logoColor=white)
![AI Agent](https://img.shields.io/badge/Multi--Agent_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)
![DGrid](https://img.shields.io/badge/DGrid_AI_Gateway-7C3AED?style=for-the-badge)
![MYX Finance](https://img.shields.io/badge/MYX_Finance-FF6B35?style=for-the-badge)
![Pieverse](https://img.shields.io/badge/Pieverse_Skill-10B981?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Bounty Tracks](#-bounty-tracks)
- [Deployed Contracts](#-deployed-contracts-bsc-testnet)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [API Endpoints](#-api-endpoints)
- [Example Queries](#-example-queries)
- [Project Structure](#-project-structure)
- [Demo](#-demo)

---

## 🌟 Overview

**The Problem:** Navigating BNB Chain DeFi is fragmented. Users switch between multiple dashboards — DeFiLlama for TVL, protocol UIs for deposits, block explorers for analytics, and perpetual DEX interfaces for funding rates. Making informed decisions requires manual aggregation of data from 5+ sources.

**The Solution:** DefiSage unifies everything into a single conversational AI interface. A multi-agent system powered by **ADK-TS** and **DGrid AI Gateway** coordinates specialized agents that:

1. **Research** — Pull live data from DeFiLlama, MYX Finance, CoinGecko, and BscScan
2. **Analyze** — Compare yields, assess risks, and recommend strategies
3. **Execute** — Build, simulate, and execute transactions with explicit user approval

All through natural language — no dashboards, no manual lookups.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔍 **Live DeFi Research** | Real-time protocol data (TVL, APY, yields) from DeFiLlama for all BNB Chain protocols |
| 📊 **Perpetual Futures Analysis** | MYX Finance perp data — funding rates, available markets, max leverage, and trading pairs |
| 🪙 **Market Intelligence** | CoinGecko-powered price feeds, market cap, 24h volume, and trending tokens |
| 🔗 **On-Chain Analytics** | BscScan-powered wallet balances, transaction history, and contract verification |
| 💰 **DeFi Execution** | Deposit, withdraw, and manage positions across Venus, PancakeSwap, and Lista |
| 🛡️ **Transaction Safety** | Every transaction is simulated first, gas estimated, and requires explicit user approval |
| 🔄 **DGrid Fallback** | Automatic failover to DGrid AI Gateway when primary LLM is unavailable |
| 🐱 **Pieverse Skill** | Published as a skill for Purrfect Claw agents — TEE-secured wallet execution |

---

## 🏗️ Architecture

DefiSage uses a **multi-agent orchestration** pattern built with ADK-TS. Each agent specializes in a domain-specific task:

```
                              User Query (Natural Language)
                                         │
                                         ▼
                            ┌────────────────────────┐
                            │   🎯 Query Router      │
                            │   Intent Classification │
                            └────────┬───────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
           ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
           │ 📊 Market    │ │ 🔗 OnChain   │ │ 💰 Strategy  │
           │   Analyst    │ │   Analyst    │ │    Agent     │
           │              │ │              │ │              │
           │ • DeFiLlama  │ │ • BscScan    │ │ • Tx Builder │
           │ • MYX Finance│ │ • Wallet Bal │ │ • Simulator  │
           │ • CoinGecko  │ │ • Tx History │ │ • Executor   │
           └──────────────┘ └──────────────┘ └──────┬───────┘
                                                     │
                                                     ▼
                                            ┌──────────────┐
                                            │ 🔐 Execution │
                                            │    Agent     │
                                            │              │
                                            │ • Simulate   │
                                            │ • Approve    │
                                            │ • Execute    │
                                            └──────────────┘
                                                     │
                                                     ▼
                                         ┌──────────────────┐
                                         │  BSC Testnet      │
                                         │  (Chain ID: 97)   │
                                         └──────────────────┘
```

### Agent Roles

| Agent | Responsibility | Tools Used |
|-------|---------------|------------|
| **Coordinator** | Classifies user intent (research, deposit, greeting) and delegates to the right sub-agent | Query Router |
| **Research Coordinator** | Orchestrates research sub-agents for complex multi-source queries | Market Analyst, OnChain Analyst |
| **Market Analyst** | Fetches live DeFi protocol data, yield comparisons, and perpetual futures info | DeFiLlama API, MYX Finance API, CoinGecko |
| **OnChain Analyst** | Analyzes wallet activity, transaction history, and contract data on-chain | BscScan API |
| **Strategy Agent** | Builds transaction parameters for deposits, withdrawals, and swaps | Transaction Builder |
| **Simulation Agent** | Verifies transaction safety — gas estimation, balance checks, contract validation | BSC Testnet RPC |
| **Execution Agent** | Executes approved transactions on BSC Testnet and returns confirmation | ethers.js, BSC RPC |

### LLM Architecture

```
                  ┌──────────────────┐
                  │  User Request    │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │  Gemini 2.5 Flash│ ← Primary (via ADK-TS native)
                  │  (Google GenAI)  │
                  └────────┬─────────┘
                           │
                     ┌─────┴─────┐
                     │ 503 Error?│
                     └─────┬─────┘
                      YES  │  NO
                   ┌───────┘    └──→ Response
                   ▼
           ┌──────────────────┐
           │  DGrid Gateway   │ ← Automatic Fallback
           │  (api.dgrid.ai)  │
           │  gemini-2.5-flash│
           └──────────────────┘
                   │
                   ▼
               Response
```

---

## 🏆 Bounty Tracks

### 🎪 Main Track — Four.meme AI Sprint
**Multi-agent AI DeFi system on BNB Chain.**

DefiSage demonstrates genuine innovation in AI × Web3 by combining:
- Multi-agent orchestration with specialized roles (research, strategy, execution)
- Live data integration from 4+ external APIs
- On-chain transaction execution with safety simulation
- Natural language interface eliminating dashboard fragmentation

### 📈 MYX Finance — Permissionless AI Perp Hunt
**Integrated MYX Finance perpetual futures data.**

The Market Analyst agent queries MYX Finance's API to retrieve:
- Available perpetual trading pairs on BNB Chain
- Real-time funding rates for each pair
- Maximum leverage configurations
- Market contract addresses

Users can ask natural language questions like *"Show MYX perpetual funding rates"* and receive structured, real-time data.

**Implementation:** [`backend/src/tools/web3/myx-perp-data.ts`](backend/src/tools/web3/myx-perp-data.ts)

### 🌐 DGrid — Build Smarter Apps with Unified LLM Access
**All LLM inference utilizes DGrid AI Gateway.**

DefiSage integrates DGrid in two ways:
1. **Automatic Fallback** — When Gemini's native API is unavailable (503), the system automatically fails over to DGrid's `api.dgrid.ai/v1` endpoint. This ensures 100% uptime for users.
2. **Dedicated Endpoint** — The `/api/dgrid` endpoint demonstrates direct DGrid usage for standalone LLM queries.

DGrid provides unified access to `google/gemini-2.5-flash` through an OpenAI-compatible interface, demonstrating how production apps can use DGrid as a reliability layer.

**Implementation:** [`backend/src/config/llm.ts`](backend/src/config/llm.ts)

### 🐱 Pieverse — Purrfect Claw Web3 Skills
**Published as a DeFi research skill on Pieverse Skill Store.**

DefiSage is packaged as an installable skill for Purrfect Claw agents, enabling any agent to:
- Research DeFi protocols and yields on BNB Chain
- Execute swaps via PancakeSwap
- Deposit into lending protocols (Venus, Lista)
- Buy meme tokens on Four.meme
- Check portfolio and wallet balances

All execution uses Purrfect Claw's **TEE-secured wallet** — private keys never leave the Trusted Execution Environment.

**Skill Package:** [`pieverse/defi-research/SKILL.md`](pieverse/defi-research/SKILL.md)

---

## 📜 Deployed Contracts (BSC Testnet)

All smart contracts are deployed and verified on **BSC Testnet (Chain ID: 97)**.

| Contract | Address | Purpose |
|----------|---------|---------|
| **MockUSDC** | [`0x3B38E69728798BF5239D13654ca63e9ad3885A44`](https://testnet.bscscan.com/address/0x3B38E69728798BF5239D13654ca63e9ad3885A44) | ERC-20 test stablecoin for demo deposits |
| **MockVault** | [`0xAcfE2B5B40061b935E2883695733ede96259E394`](https://testnet.bscscan.com/address/0xAcfE2B5B40061b935E2883695733ede96259E394) | DeFi vault contract for simulated yield strategies |

### Contract Details

**MockUSDC** (`MockUSDC.sol`)
- Standard ERC-20 with mint capability
- Used for testing deposit/withdrawal flows
- Allows free minting for demo purposes

**MockVault** (`MockVault.sol`)
- Accepts MockUSDC deposits
- Tracks user positions and balances
- Simulates a simple yield vault (similar to Venus/Lista)

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **AI/LLM** | Gemini 2.5 Flash + DGrid Gateway | Primary model + fallback routing |
| **Agent Framework** | ADK-TS (IQ AI) | Multi-agent orchestration and tool calling |
| **Blockchain** | BNB Chain (BSC Testnet, Chain ID: 97) | Smart contract deployment and execution |
| **Smart Contracts** | Solidity 0.8.20, Hardhat | MockUSDC and MockVault contracts |
| **Backend** | Node.js, Express, TypeScript | REST API server with agent integration |
| **Frontend** | Next.js, React, Tailwind CSS | Chat interface and wallet connection |
| **Wallet** | Wagmi v2, MetaMask | Transaction signing and wallet state |
| **Data Sources** | DeFiLlama, MYX Finance, CoinGecko, BscScan | Live DeFi and market data |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **MetaMask** wallet configured for BSC Testnet
- **API Keys:** Google AI (Gemini), DGrid, BscScan

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/DefiSage.git
cd DefiSage

# Backend
cd backend
npm install

# Frontend (new terminal)
cd frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
# LLM Configuration
GOOGLE_API_KEY=your_gemini_api_key
DGRID_API_KEY=your_dgrid_api_key

# BSC Testnet
TESTNET_PRIVATE_KEY=your_wallet_private_key
BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.bnbchain.org:8545
BSCSCAN_API_KEY=your_bscscan_api_key

# Deployed Contracts
MOCK_USDC_ADDRESS=0x3B38E69728798BF5239D13654ca63e9ad3885A44
MOCK_VAULT_ADDRESS=0xAcfE2B5B40061b935E2883695733ede96259E394
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend
npm run server       # Starts on http://localhost:3001

# Terminal 2 — Frontend
cd frontend
npm run dev          # Starts on http://localhost:3000
```

### 4. Test

Open `http://localhost:3000` and ask:
- *"What are the top DeFi protocols on BNB Chain?"*
- *"Show MYX perpetual funding rates"*
- *"Deposit 100 USDC to Venus"*

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check — confirms server and agent status |
| `POST` | `/api/query` | Main query endpoint — processes natural language DeFi queries |
| `POST` | `/api/approve` | Approves a pending transaction for on-chain execution |
| `POST` | `/api/dgrid` | Direct DGrid AI Gateway endpoint for standalone LLM queries |

### Query Request

```bash
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the top DeFi protocols on BNB Chain?"}'
```

### Response Format

```json
{
  "requestId": "1776864194344",
  "response": "Here are the top DeFi protocols on BNB Chain by TVL...",
  "requiresApproval": false,
  "transactions": null,
  "duration": 3200,
  "timestamp": "2026-04-22T13:23:25.450Z"
}
```

### DGrid Endpoint

```bash
curl -X POST http://localhost:3001/api/dgrid \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Analyze Venus Protocol lending rates on BNB Chain"}'
```

---

## 💬 Example Queries

### DeFi Research
| Query | What Happens |
|-------|-------------|
| *"What are the top DeFi protocols on BNB Chain?"* | Market Analyst queries DeFiLlama → returns protocols sorted by TVL |
| *"Compare Venus and PancakeSwap yields"* | Fetches APY/TVL data for both → side-by-side comparison |
| *"Show me the best lending rates"* | Queries all BNB lending protocols → ranks by APY |

### Perpetual Futures (MYX)
| Query | What Happens |
|-------|-------------|
| *"Show MYX perpetual funding rates"* | Queries MYX Finance API → returns live funding rates for all pairs |
| *"What pairs can I trade on MYX?"* | Returns available perp markets with leverage info |

### Transaction Execution
| Query | What Happens |
|-------|-------------|
| *"Deposit 100 USDC to Venus"* | Strategy Agent builds tx → Simulator verifies → asks for approval |
| *"Deposit 50 USDC into the safest protocol"* | Research first → recommends protocol → builds tx → approval |

### On-Chain Analytics
| Query | What Happens |
|-------|-------------|
| *"Check wallet 0x... balance"* | OnChain Analyst queries BscScan → returns BNB + token balances |

---

## 📁 Project Structure

```
DefiSage/
├── backend/
│   ├── src/
│   │   ├── agents/                    # Multi-agent system
│   │   │   ├── coordinator/
│   │   │   │   └── coordinator-agent.ts    # Intent classification & delegation
│   │   │   ├── research/
│   │   │   │   ├── research-coordinator.ts # Orchestrates research sub-agents
│   │   │   │   ├── market-analyst.ts       # DeFi data + MYX perps
│   │   │   │   └── onchain-analyst.ts      # BscScan analytics
│   │   │   ├── strategy/
│   │   │   │   └── strategy-agent.ts       # Transaction building
│   │   │   ├── simulation/
│   │   │   │   └── simulation-agent.ts     # Safety verification
│   │   │   └── execution/
│   │   │       └── execution-agent.ts      # On-chain execution
│   │   ├── config/
│   │   │   └── llm.ts                 # DGrid AI Gateway + Gemini config
│   │   ├── tools/web3/
│   │   │   ├── defi-data.ts           # DeFiLlama integration
│   │   │   ├── myx-perp-data.ts       # MYX Finance perpetuals
│   │   │   ├── blockchain-query.ts    # BscScan queries
│   │   │   ├── transaction-builder.ts # Tx parameter construction
│   │   │   ├── transaction-simulator.ts # Gas + balance checks
│   │   │   └── transaction-executor.ts # On-chain execution
│   │   ├── utils/
│   │   │   └── query-router.ts        # Query classification logic
│   │   ├── server.ts                  # Express API server
│   │   └── main.ts                    # CLI entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/                       # Next.js app router
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx      # Main chat UI
│   │   │   └── Portfolio.tsx          # Wallet/position display
│   │   └── lib/
│   │       ├── wagmi.ts               # BSC Testnet Web3 config
│   │       └── contracts.ts           # Deployed contract addresses
│   └── package.json
├── contracts/
│   ├── contracts/
│   │   ├── MockUSDC.sol               # Test ERC-20 stablecoin
│   │   └── MockVault.sol              # DeFi vault contract
│   ├── scripts/
│   │   └── deploy.js                  # BSC deployment script
│   └── hardhat.config.js              # BSC Testnet config
├── pieverse/
│   ├── defi-research/
│   │   └── SKILL.md                   # Pieverse skill definition
│   └── defi-research-skill.tar.gz     # Packaged skill archive
└── README.md
```

---

## 🎬 Demo

### Transaction Flow
```
Ask Question → Agent Researches → Strategy Builds Tx → Simulator Verifies → User Approves → Executed on BSC
```

### Video Demo
See the [demo video](demo/) for a complete walkthrough of:
1. Querying top DeFi protocols on BNB Chain (DeFiLlama integration)
2. Fetching MYX perpetual funding rates (MYX bounty)
3. Depositing USDC to Venus with transaction approval
4. DGrid AI Gateway fallback in action
5. Pieverse skill capabilities

---

## 🔐 Security

- **Explicit Approval** — Every transaction requires user confirmation before execution
- **Transaction Simulation** — Gas estimation and balance checks before any on-chain action
- **No Key Exposure** — Wallet keys stay in `.env` (backend) or MetaMask (frontend)
- **TEE Execution** — Pieverse skill uses Purrfect Claw's Trusted Execution Environment
- **Contract Verification** — All deployed contracts are verified on BscScan

---

## 📄 License

MIT

---

## 🙏 Acknowledgements

- [Four.meme](https://four.meme) — Hackathon organizer
- [DGrid](https://dgrid.ai) — Unified LLM access gateway
- [MYX Finance](https://myx.finance) — Perpetual DEX on BNB Chain
- [Pieverse](https://pieverse.ai) — AI skill marketplace
- [DeFiLlama](https://defillama.com) — DeFi TVL and yield data
- [BNB Chain](https://www.bnbchain.org) — Blockchain infrastructure

---

*Built with ❤️ for the Four.meme AI Sprint Hackathon*
