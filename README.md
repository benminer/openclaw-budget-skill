# Budget Skill for OpenClaw

Personal finance tool that connects to your bank accounts, tracks spending, sets budgets, and sends you weekly/daily spending reports.

## What It Does

- **Connect Your Banks** - Securely link checking, savings, and credit cards
- **Automatic Transaction Tracking** - Pulls transactions daily and categorizes them
- **Budget Management** - Set spending limits by category (food, entertainment, etc.)
- **Spending Reports** - Get weekly summaries and daily transaction reviews
- **Smart Categorization** - Learns your spending patterns and merchants

## Setup

### 1. Sign Up for SimpleFIN

SimpleFIN is a secure banking connection service ($2/month per bank account).

1. Go to [SimpleFIN Bridge](https://beta-bridge.simplefin.org/)
2. Click **"Create a SimpleFIN Bridge"**
3. Enter your email
4. You'll receive a **Setup Token** (a long string)

### 2. Connect Your Bank

1. Visit the setup URL from your email
2. Search for your bank (Chase, Capital One, etc.)
3. Enter your online banking credentials
4. SimpleFIN will give you an **Access URL** — save this, you'll need it next

**Cost:** $2/month per bank connection (billed annually: $24/year)

### 3. Install the Budget Skill

In your OpenClaw chat:

```
Add the budget skill to your workspace
```

Or manually download from: [github.com/benminer/openclaw-budget-skill](https://github.com/benminer/openclaw-budget-skill)

### 4. Configure Access

Run the setup:
```bash
budget-skill setup
```

This creates a config file at `~/.openclaw/workspace/data/simplefin/config.json`

Edit it and paste your **Access URL** from SimpleFIN:
```json
{
  "access_url": "https://YOUR_ACCESS_URL_HERE"
}
```

### 5. Test the Connection

Fetch your accounts:
```bash
budget-skill accounts
```

You should see all connected bank accounts with balances.

Fetch transactions:
```bash
budget-skill fetch --days 30
```

Generate a spending report:
```bash
budget-skill report --period weekly
```

## Daily Use

### View Your Balances
```bash
budget-skill accounts
```

### Check Recent Spending
```bash
budget-skill report --period weekly
```

Or for the current month:
```bash
budget-skill report --period monthly
```

### Set a Budget
```bash
budget-skill budget set --category FOOD_AND_DRINK --limit 500 --period monthly
```

### Check Budget Status
```bash
budget-skill budget status
```

## Automated Reports

The skill can send you:
- **Daily transaction reviews** (every evening at 10 PM)
- **Weekly spending summaries** (Sunday at 7 PM)

Ask your OpenClaw assistant to set these up via cron jobs.

## Spending Categories

Transactions are automatically categorized:
- **FOOD_AND_DRINK** - Groceries, restaurants, delivery
- **TRANSPORTATION** - Gas, Uber, public transit
- **ENTERTAINMENT** - Streaming, movies, events
- **SUBSCRIPTIONS** - Software, services
- **PERSONAL_SERVICES** - Gym, trainer, salon
- **AUTO_LOAN** - Car payments
- **SAVINGS** - Investment contributions
- **HOUSING** - Rent, mortgage
- **UTILITIES** - Electric, water, internet
- **TRANSFER** - Internal transfers, P2P payments

### Personalizing Merchant Categories

The skill works out of the box with generic categorization, but you can teach it your specific merchants for more accurate tracking.

**Create your personal rules file:**

1. Copy the example file:
   ```bash
   cp personal-categories.example.json personal-categories.json
   ```

2. Ask your OpenClaw agent to generate personalized rules:
   ```
   Review my recent transactions and create a personal-categories.json file 
   that categorizes my recurring merchants (car loans, subscriptions, etc.)
   ```

Your agent will:
- Analyze your transaction history
- Identify recurring merchants
- Create custom categorization rules
- Track important balances (like loan payoffs)

The `personal-categories.json` file stays on your machine and isn't shared in the repository.

## Privacy & Security

- All data stays on your computer (no cloud storage)
- SimpleFIN uses bank-level encryption
- Your Access URL acts as your password — keep it secure
- Data is stored locally in `~/.openclaw/workspace/data/simplefin/`

## Troubleshooting

**"Config not found"**  
→ Run `budget-skill setup` first

**"No transactions found"**  
→ Run `budget-skill fetch --days 30` to sync

**"Empty transactions for a bank"**  
→ Some banks take 24 hours to sync after first connection. Try again tomorrow.

**Need to reconnect a bank?**  
→ Go to [SimpleFIN Bridge](https://beta-bridge.simplefin.org/), re-authenticate, and the Access URL stays the same

## Support

- **SimpleFIN Help**: [SimpleFIN Support](https://beta-bridge.simplefin.org/contact)
- **Skill Issues**: [GitHub Issues](https://github.com/benminer/openclaw-budget-skill/issues)

## License

MIT - Free to use and modify
