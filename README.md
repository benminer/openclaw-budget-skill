# SimpleFIN Budget Skill for OpenClaw

OpenClaw skill for connecting bank accounts via SimpleFIN Bridge, tracking transactions, categorizing spending, setting budgets, and generating financial reports.

**Migrated from Plaid** — SimpleFIN is simpler, cheaper ($2/month), and designed for personal projects.

## Features

- 🏦 **Bank Connection**: Connect real bank accounts via SimpleFIN ($2/month)
- 📊 **Transaction Tracking**: Auto-fetch and categorize transactions
- 💰 **Budget Management**: Set limits by category (monthly/weekly)
- 📈 **Spending Reports**: View spending by category, top merchants, trends
- 🔐 **Secure**: Access URL contains auth token, no credentials stored

## Installation

1. Install the skill in OpenClaw
2. Run setup:
   ```bash
   cd scripts
   node setup.js
   ```
3. Sign up for SimpleFIN and add your Access URL to `~/.openclaw/workspace/data/simplefin/config.json`

## Quick Start

```bash
# Fetch connected accounts
node scripts/fetch_accounts.js

# Fetch transactions (last 30 days)
node scripts/fetch_transactions.js --days=30

# Set a monthly budget
node scripts/set_budget.js --category=FOOD_AND_DRINK --limit=500 --period=monthly

# Check budget status
node scripts/budget_status.js

# Generate spending report
node scripts/report.js --period=monthly
```

## Get SimpleFIN Access

1. Sign up at [beta-bridge.simplefin.org](https://beta-bridge.simplefin.org/)
2. Click **"Create a SimpleFIN Bridge"**
3. Connect your bank via their web interface
4. Copy your **Access URL** (looks like `https://bridge.simplefin.org/simplefin/<token>`)
5. Paste it into your config.json

**Pricing**: $2/month per bank connection (billed annually, $24/year). No business registration required.

## Why SimpleFIN over Plaid?

- ✅ **Personal-friendly**: No business registration or review process
- ✅ **Cheaper**: $2/month vs Plaid's $100+/month production plans
- ✅ **Simpler API**: REST endpoints, no SDK needed
- ✅ **Privacy-focused**: Data stays between you and SimpleFIN

## Documentation

See `SKILL.md` for complete workflows and usage details.

See `references/plaid_api.md` for SimpleFIN API documentation.

## License

MIT

## Contributing

Pull requests welcome! This is an open-source OpenClaw skill.

---

**Note**: Skill was originally built for Plaid but migrated to SimpleFIN for ease of use in personal projects.
