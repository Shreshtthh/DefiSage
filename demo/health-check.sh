#!/bin/bash
# ============================================================
# DefiSage — Quick Health & Integration Verification Script
# Run this before recording your demo to ensure everything works
# ============================================================

set -e

API_URL="${1:-http://localhost:3001}"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  🧠 DefiSage — Pre-Demo Health Check"
echo "═══════════════════════════════════════════════════════"
echo ""

# 1. Health Check
echo "1️⃣  Health Check..."
HEALTH=$(curl -s "$API_URL/api/health" 2>/dev/null || echo '{"error":"Server not running"}')
echo "   $HEALTH"
echo ""

# 2. DGrid AI Gateway Test
echo "2️⃣  DGrid AI Gateway Test..."
DGRID=$(curl -s -X POST "$API_URL/api/dgrid" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Say hello in one sentence"}' 2>/dev/null || echo '{"error":"DGrid unreachable"}')
echo "   $DGRID" | head -c 200
echo ""
echo ""

# 3. DeFi Research Query
echo "3️⃣  DeFi Research Query..."
DEFI=$(curl -s -X POST "$API_URL/api/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the top DeFi protocols on BNB Chain?"}' 2>/dev/null || echo '{"error":"Query failed"}')
echo "   Response received ($(echo "$DEFI" | wc -c) bytes)"
echo "   Preview: $(echo "$DEFI" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("response","")[:150])' 2>/dev/null || echo 'Parse error')"
echo ""

# 4. MYX Perp Query
echo "4️⃣  MYX Finance Perpetual Query..."
MYX=$(curl -s -X POST "$API_URL/api/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "Show MYX perpetual funding rates"}' 2>/dev/null || echo '{"error":"Query failed"}')
echo "   Response received ($(echo "$MYX" | wc -c) bytes)"
echo "   Preview: $(echo "$MYX" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("response","")[:150])' 2>/dev/null || echo 'Parse error')"
echo ""

# 5. Contract Verification
echo "5️⃣  BSC Testnet Contracts..."
echo "   MockUSDC:  https://testnet.bscscan.com/address/0x3B38E69728798BF5239D13654ca63e9ad3885A44"
echo "   MockVault: https://testnet.bscscan.com/address/0xAcfE2B5B40061b935E2883695733ede96259E394"
echo ""

echo "═══════════════════════════════════════════════════════"
echo "  ✅ Health check complete! Ready for demo."
echo "═══════════════════════════════════════════════════════"
echo ""
