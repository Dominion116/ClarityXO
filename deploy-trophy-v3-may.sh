#!/bin/bash

# Deploy ClarityXO Trophy v3 and setup May (month 220)
# Prerequisites:
#   - clarinet CLI installed
#   - settings/Mainnet.toml has valid deployer mnemonic
#   - On mainnet (set NETWORK=mainnet below)

set -e

NETWORK="mainnet"
CONTRACT="clarityxotrophyv3"
MONTH=220

# Step 1: Deploy the contract
echo "🚀 Deploying $CONTRACT to $NETWORK..."
clarinet deployments apply \
  --deployment deployments/default.mainnet-plan.yaml \
  --network "$NETWORK"

echo "✓ Contract deployed. Waiting 10 seconds for confirmation..."
sleep 10

# Step 2: Set May's image base URI
echo "📸 Setting May image URI..."
clarinet tx call set-month-uri \
  --network "$NETWORK" \
  --from deployer \
  "$CONTRACT" set-month-uri \
  "(u $MONTH)" \
  '(concat "" "https://scarlet-large-hummingbird-596.mypinata.cloud/ipfs/bafybeib6x6w7u4emwb4k7ky757xhw4u367ttykskchj6q522ttd2jh4fgm/")'

echo "✓ Month URI set"
sleep 5

# Step 3: Set mint fee (0.02 STX = 20,000 microstx)
echo "💰 Setting mint fee to 0.02 STX..."
clarinet tx call set-mint-fee \
  --network "$NETWORK" \
  --from deployer \
  "$CONTRACT" set-mint-fee \
  "(u 20000)"

echo "✓ Mint fee set"
sleep 5

# Step 4: Set May's top 5 winners
echo "🏆 Setting May's top 5 winners..."
clarinet tx call set-month-winners \
  --network "$NETWORK" \
  --from deployer \
  "$CONTRACT" set-month-winners \
  "(u $MONTH)" \
  "(list 'SP1VW7TPKTY8W4AWNYR00YD4E914RSWGM70VKVCAY 'SP3XR5PCCV557KE2ZZB3W04B91F6042HKZ8KNX1ZS 'SP1HCKS0FDRC50F7VWRZJ9747V2EB38YA8FXGRXNC 'SP1EM6HQFSV15WYS4G9BRMM3YF4TH9Y4437YCKTG1 'SPJY043NRW86A9SVMHPC6AZ1CWCXV21KCDC42P2N)"

echo "✓ Winners set"
sleep 5

echo ""
echo "✅ May trophy setup complete!"
echo ""
echo "Top 5 can now claim their trophies:"
echo "  clarinet tx call claim-trophy --network mainnet --from <winner> clarityxotrophyv3 claim-trophy '(u 220)'"
