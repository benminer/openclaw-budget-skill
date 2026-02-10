# Plaid Budget Skill for OpenClaw

OpenClaw skill for connecting bank accounts via Plaid API, tracking transactions, categorizing spending, setting budgets, and generating financial reports.

## Features

- 🏦 **Bank Connection**: Sandbox testing with Plaid's test banks
- 📊 **Transaction Tracking**: Auto-fetch and categorize transactions
- 💰 **Budget Management**: Set limits by category (monthly/weekly)
- 📈 **Spending Reports**: View spending by category, top merchants, trends
- 🔐 **Secure**: API keys stored locally, no credentials in code

## Installation

1. Install the skill in OpenClaw
2. Run setup:
   ```bash
   cd scripts
   node setup.js
   ```
3. Add your Plaid API keys to `~/.openclaw/workspace/data/plaid/config.json`

## Quick Start

```bash
# Connect a sandbox bank account
node scripts/auth_sandbox.js --institution_id=ins_56

# Fetch transactions (last 30 days)
node scripts/fetch_transactions.js --access_token=<your_token> --days=30

# Set a monthly budget
node scripts/set_budget.js --category=FOOD_AND_DRINK --limit=500 --period=monthly

# Check budget status
node scripts/budget_status.js --access_token=<your_token>

# Generate spending report
node scripts/report.js --access_token=<your_token> --period=monthly
```

## Get Plaid API Keys

1. Sign up at [plaid.com](https://dashboard.plaid.com/signup)
2. Create a new app in the dashboard
3. Get your `client_id` and `sandbox` secret
4. Add them to your config.json

## Sandbox Testing

Use Plaid's test bank: **Tartan Bank** (`ins_56`)
- Username: `user_good`
- Password: `pass_good`

This creates fake transactions for testing without connecting real banks.

## Documentation

See `SKILL.md` for complete workflows and usage details.

See `references/plaid_api.md` for API endpoint documentation.

## License

MIT

## Contributing

Pull requests welcome! This is an open-source OpenClaw skill.
