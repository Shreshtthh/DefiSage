#!/bin/bash
# ============================================================
# DefiSage — Automated Demo Sequence
# Runs through all demo queries with delays for recording
# ============================================================

API_URL="${1:-http://localhost:3001}"
DELAY=5  # seconds between queries

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  🎬 DefiSage — Automated Demo Sequence"
echo "  Recording all bounty track demonstrations"
echo "═══════════════════════════════════════════════════════"
echo ""

# Helper function
query() {
  local label="$1"
  local query="$2"
  local bounty="$3"

  echo "───────────────────────────────────────────────────"
  echo "  $bounty"
  echo "  Query: \"$query\""
  echo "───────────────────────────────────────────────────"
  
  RESPONSE=$(curl -s -X POST "$API_URL/api/query" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$query\"}")
  
  echo ""
  echo "$RESPONSE" | python3 -c '
import sys, json
try:
    d = json.load(sys.stdin)
    print("📤 Response:")
    print(d.get("response", "No response"))
    print()
    if d.get("requiresApproval"):
        print("⚠️  Transaction requires approval!")
        if d.get("transactions"):
            print(json.dumps(d["transactions"], indent=2))
    print(f"⏱️  Duration: {d.get("duration", "?")}ms")
except:
    print(sys.stdin.read())
' 2>/dev/null
  echo ""
  sleep $DELAY
}

# ── Scene 1: Main Track — DeFi Research ──
query "defi_research" \
  "What are the top DeFi protocols on BNB Chain?" \
  "🏆 MAIN TRACK: DeFi Protocol Research"

# ── Scene 2: Main Track — Protocol Comparison ──
query "comparison" \
  "Compare Venus and PancakeSwap" \
  "🏆 MAIN TRACK: Protocol Comparison"

# ── Scene 3: MYX Bounty — Perpetual Futures ──
query "myx_perps" \
  "Show MYX perpetual funding rates" \
  "📈 MYX BOUNTY: Perpetual Futures Data"

# ── Scene 4: DGrid Bounty — Direct Gateway ──
echo "───────────────────────────────────────────────────"
echo "  🌐 DGRID BOUNTY: Direct AI Gateway Call"
echo "───────────────────────────────────────────────────"

DGRID_RESPONSE=$(curl -s -X POST "$API_URL/api/dgrid" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Analyze the top 3 lending protocols on BNB Chain. Include TVL and key features."}')

echo ""
echo "$DGRID_RESPONSE" | python3 -c '
import sys, json
try:
    d = json.load(sys.stdin)
    print("📤 DGrid Response:")
    print(d.get("response", d.get("error", "No response")))
except:
    print(sys.stdin.read())
' 2>/dev/null
echo ""
sleep $DELAY

# ── Scene 5: Main Track — Transaction Execution ──
query "deposit" \
  "Deposit 100 USDC to Venus" \
  "💰 MAIN TRACK: Transaction Execution"

# ── Summary ──
echo "═══════════════════════════════════════════════════════"
echo "  ✅ Demo sequence complete!"
echo ""
echo "  Bounty Tracks Demonstrated:"
echo "    🏆 Main Track    — DeFi research + transaction execution"
echo "    📈 MYX Finance   — Perpetual funding rates"
echo "    🌐 DGrid         — AI Gateway direct call + fallback"
echo "    🐱 Pieverse       — See pieverse/defi-research/SKILL.md"
echo ""
echo "  Deployed Contracts (BSC Testnet):"
echo "    MockUSDC:  0x3B38E69728798BF5239D13654ca63e9ad3885A44"
echo "    MockVault: 0xAcfE2B5B40061b935E2883695733ede96259E394"
echo "═══════════════════════════════════════════════════════"
