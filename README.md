# 🧠 ChainInsight — AI-Powered DeFi Research Agent for BNB Chain

> Multi-agent AI system that researches, analyzes, and executes DeFi strategies on BNB Chain. Built for the **Four.meme AI Sprint** hackathon.

![BNB Chain](https://img.shields.io/badge/BNB_Chain-F0B90B?style=for-the-badge&logo=binance&logoColor=white)
![AI Agent](https://img.shields.io/badge/AI_Agent-4285F4?style=for-the-badge&logo=google&logoColor=white)
![DGrid](https://img.shields.io/badge/DGrid_Gateway-7C3AED?style=for-the-badge)
![MYX Finance](https://img.shields.io/badge/MYX_Finance-FF6B35?style=for-the-badge)

---

## 🎯 What is ChainInsight?

ChainInsight is an **AI-powered DeFi research and execution agent** that uses a multi-agent architecture to help users navigate the DeFi ecosystem on BNB Chain. Instead of manually checking multiple dashboards and protocols, you simply ask ChainInsight in natural language.

### Key Features

- 🔍 **Live DeFi Research** — Query real-time protocol data (TVL, APY, yields) from DeFiLlama
- 📊 **Perpetual Futures Analysis** — Fetch MYX Finance perp data (funding rates, markets, leverage)
- 🪙 **Market Intelligence** — CoinGecko-powered price feeds and trending token data
- 🔗 **On-Chain Analytics** — BscScan-powered wallet and transaction analysis
- 💰 **DeFi Execution** — Deposit, withdraw, and manage positions with user approval
- 🛡️ **Safety First** — Transaction simulation + explicit approval before any on-chain action

---

## 🏗️ Architecture

ChainInsight uses a **multi-agent system** built with the ADK-TS framework. Each agent specializes in a specific domain:

```
User Query
    │
    ▼
┌─────────────────────────┐
│   Coordinator Agent     │ ← Classifies intent, delegates
│   (DGrid AI Gateway)    │
└─────┬───────┬───────────┘
      │       │
      ▼       ▼
┌─────────┐ ┌─────────────┐
│ Market  │ │  Strategy   │
│ Analyst │ │   Agent     │
│         │ │             │
│ • DeFi  │ │ • Build Tx  │
│ • MYX   │ │ • Simulate  │
│ • Price │ │ • Execute   │
└─────────┘ └─────────────┘
```

### Agents

| Agent | Role | Tools |
|-------|------|-------|
| **Coordinator** | Query classification & delegation | Routes to sub-agents |
| **Market Analyst** | DeFi protocol & perp research | DeFiLlama, MYX Finance API, CoinGecko |
| **OnChain Analyst** | Blockchain data analysis | BscScan API |
| **Strategy Agent** | Transaction building | Transaction Builder |
| **Simulation Agent** | Safety verification | Gas estimation, balance checks |
| **Execution Agent** | On-chain execution | BSC Testnet transactions |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **AI/LLM** | DGrid AI Gateway (unified LLM access) |
| **Agent Framework** | ADK-TS (multi-agent orchestration) |
| **Blockchain** | BNB Chain (BSC Testnet) |
| **Smart Contracts** | Solidity 0.8.20, Hardhat |
| **Backend** | Node.js, Express, TypeScript |
| **Frontend** | React, Vite, Tailwind CSS |
| **Wallet** | Wagmi, MetaMask |
| **Data Sources** | DeFiLlama, MYX Finance API, CoinGecko, BscScan |

---

## 🎪 Bounty Tracks

### 🏆 Four.meme AI Sprint — Main Track
Multi-agent AI DeFi research system showcasing innovation in AI x Web3 integration.

### 📈 MYX — Permissionless AI Perp Hunt
Integrated MYX Finance API for real-time perpetual futures data — funding rates, market contracts, and leverage analysis through natural language queries.

### 🌐 DGrid — AI Gateway Challenge
All LLM inference routes through the **DGrid AI Gateway** (`api.dgrid.ai/v1`), demonstrating unified LLM access across the entire multi-agent system.

### 🐱 Pieverse — Purrfect Claw Web3 Skills
Published a DeFi research skill to the **Pieverse Skill Store** — enabling Purrfect Claw agents to perform DeFi research, execute swaps via PancakeSwap, deposit to Lista vaults, and buy tokens on Four.meme using TEE-secured wallets.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask wallet with BSC Testnet configured
- DGrid API key ([get one here](https://dgrid.ai/api-keys))

### Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ChainInsight.git
cd ChainInsight

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your keys (see setup.md for details)

# Start backend
npm run server

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

### Environment Variables

```env
# DGrid AI Gateway
DGRID_API_KEY=your_dgrid_key

# Fallback LLM
GOOGLE_API_KEY=your_gemini_key

# BSC Testnet
TESTNET_PRIVATE_KEY=your_wallet_private_key
BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.bnbchain.org:8545
BSCSCAN_API_KEY=your_bscscan_key

# Contract Addresses
MOCK_USDC_ADDRESS=deployed_address
MOCK_VAULT_ADDRESS=deployed_address
```

---

## 📸 Demo

### Chat Interface
Ask questions in natural language — ChainInsight researches protocols, compares yields, and executes transactions with your approval.

### Example Queries
- "What are the top DeFi protocols on BNB Chain?"
- "Show MYX perpetual funding rates"
- "Compare PancakeSwap and Venus yields"
- "Deposit 100 USDC to Venus"

### Transaction Flow
```
Research → Strategy → Simulate → Approve → Execute
```
Every transaction is simulated first, then requires explicit user approval before execution.

---

## 📁 Project Structure

```
ChainInsight/
├── backend/
│   ├── src/
│   │   ├── agents/          # Multi-agent system
│   │   │   ├── coordinator/ # Query classification & delegation
│   │   │   ├── research/    # Market + on-chain analysis
│   │   │   ├── strategy/    # Transaction building
│   │   │   ├── simulation/  # Safety verification
│   │   │   └── execution/   # On-chain execution
│   │   ├── config/
│   │   │   └── llm.ts       # DGrid AI Gateway config
│   │   ├── tools/web3/      # Blockchain interaction tools
│   │   │   ├── defi-data.ts        # DeFiLlama integration
│   │   │   ├── myx-perp-data.ts    # MYX Finance perps
│   │   │   ├── market-data.ts      # CoinGecko prices
│   │   │   ├── blockchain-query.ts # BscScan analytics
│   │   │   └── transaction-*.ts    # Tx build/sim/exec
│   │   └── server.ts        # Express API
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React UI
│   │   └── lib/             # Wagmi + contract config
│   └── package.json
├── contracts/               # Solidity smart contracts
│   ├── contracts/
│   │   ├── MockUSDC.sol     # Test ERC20 token
│   │   └── MockVault.sol    # DeFi vault for demo
│   └── hardhat.config.js
└── pieverse/                # Pieverse Skill Store skill
    └── defi-research/
        └── SKILL.md
```

---

## 📄 License

MIT

---

*Built with ❤️ for the Four.meme AI Sprint hackathon*
