# ⚙️ Setup Guide

## Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **MetaMask** browser extension
- **BSC Testnet tBNB** — Get from [faucet](https://testnet.bnbchain.org/faucet-smart)

## API Keys Required

| Service | Purpose | Get it |
|---------|---------|--------|
| **DGrid AI Gateway** | LLM inference (primary) | [dgrid.ai/api-keys](https://dgrid.ai/api-keys) |
| **Google Gemini** | LLM fallback | [aistudio.google.com](https://aistudio.google.com/apikey) |
| **BscScan** | On-chain data queries (optional) | [bscscan.com/apis](https://bscscan.com/apis) |

## Step 1: Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/REPO_NAME.git
cd REPO_NAME

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install

# Contracts (optional — only if redeploying)
cd ../contracts && npm install
```

## Step 2: Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
# DGrid AI Gateway (primary LLM)
DGRID_API_KEY=your_dgrid_api_key

# Gemini (fallback)
GOOGLE_API_KEY=your_gemini_key

# BSC Testnet
TESTNET_PRIVATE_KEY=your_wallet_private_key
BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.bnbchain.org:8545
BSCSCAN_API_KEY=your_bscscan_key

# Contract Addresses (already deployed on BSC Testnet)
MOCK_USDC_ADDRESS=<deployed_address>
MOCK_VAULT_ADDRESS=<deployed_address>
```

## Step 3: Add BSC Testnet to MetaMask

| Field | Value |
|-------|-------|
| Network Name | BSC Testnet |
| RPC URL | `https://data-seed-prebsc-1-s1.bnbchain.org:8545` |
| Chain ID | `97` |
| Currency | tBNB |
| Explorer | `https://testnet.bscscan.com` |

## Step 4: Get Test Tokens

1. Get **tBNB** from [BNB Chain Faucet](https://testnet.bnbchain.org/faucet-smart)
2. Mint **mUSDC** using the "Mint Test USDC" button in the app

## Step 5: Run

```bash
# Terminal 1 — Backend
cd backend
npm run server
# Server starts on http://localhost:3001

# Terminal 2 — Frontend
cd frontend
npm run dev
# App opens on http://localhost:5173
```

## Step 6: Verify

1. Open http://localhost:5173
2. Connect MetaMask (switch to BSC Testnet)
3. Mint test USDC
4. Ask: "What are the top DeFi protocols on BNB Chain?"
5. Try: "Deposit 100 USDC to Venus"

## Deploy Contracts (Optional)

Only needed if redeploying fresh contracts:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network bscTestnet
```

Update the new addresses in `backend/.env` and `frontend/src/lib/contracts.ts`.
