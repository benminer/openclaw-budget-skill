---
name: budget-skill
description: SimpleFIN API integration for transaction tracking, spending categorization, budgeting, and financial reports. Personal finance tool for connecting bank accounts, fetching transactions, setting budgets, and generating spending reports. Use when user requests: connect bank account, fetch transactions, categorize spending, set/track budgets, review spending, or generate financial reports. Requires SimpleFIN Access URL in config.json.
---

# Budget Skill

Connect to bank accounts via SimpleFIN Bridge, fetch transactions, categorize spending, set budgets, and generate spending reports.

**SimpleFIN** is a $2/month per-bank service designed for personal finance apps. No business registration required.

## Quick Start

1. **Setup**: Initialize data directory
   ```bash
   budget-skill setup
   ```

2. **Sign up for SimpleFIN**:
   - Go to https://beta-bridge.simplefin.org/
   - Click "Create a SimpleFIN Bridge"
   - Connect your bank ($2/month per connection)
   - Copy your **Access URL**

3. **Configure**: Edit `~/.openclaw/workspace/data/simplefin/config.json`
   ```json
   {
     "access_url": "https://bridge.simplefin.org/simplefin/<your_token>"
   }
   ```

4. **Fetch Accounts**:
   ```bash
   budget-skill accounts
   ```

5. **Fetch Transactions**:
   ```bash
   budget-skill fetch --days 30
   ```

6. **View Report**:
   ```bash
   budget-skill report --period monthly
   ```

## Core Workflows

### Bank Account Connection

SimpleFIN handles all bank connections through their web interface:
1. Sign up at https://beta-bridge.simplefin.org/
2. Use their web UI to connect banks
3. Copy your Access URL to config.json
4. Run `fetch_accounts.js` to verify

### Transaction Management

**Fetch transactions**:
```bash
budget-skill fetch --days 30
```
- Fetches last 30 days (or specify --days 90)
- Auto-categorizes using keyword matching
- Saves to `data/simplefin/transactions/transactions.json`

### Budget Tracking

**Set a budget**:
```bash
budget-skill budget set --category FOOD_AND_DRINK --limit 500 --period monthly
```

**Check budget status**:
```bash
budget-skill budget status --period monthly
```
- Shows spending vs budget for current period
- Highlights categories over budget

### Spending Reports

```bash
budget-skill report --period monthly
```
- Total spending by category
- Top 10 merchants
- Transaction counts and trends

Periods: `monthly` (current calendar month) or `weekly` (last 7 days)

## Data Storage

All data stored in: `~/.openclaw/workspace/data/simplefin/`

- `config.json` - SimpleFIN Access URL
- `accounts/accounts.json` - Connected bank accounts
- `transactions/transactions.json` - Cached transactions (categorized)
- `budgets.json` - Budget limits by category and period

## Categories

Auto-categorization based on merchant/description keywords:
- FOOD_AND_DRINK
- TRANSPORTATION
- GENERAL_MERCHANDISE
- ENTERTAINMENT
- PERSONAL_CARE
- TRAVEL
- UTILITIES
- HOUSING
- UNCATEGORIZED

Custom rules can be added to categorization logic in `fetch_transactions.js`

## Troubleshooting

**"Config not found"**: Run `node scripts/setup.js` first

**"Please add your SimpleFIN Access URL"**: Edit config.json and paste your URL from SimpleFIN

**"No transactions found"**: Run `fetch_transactions.js` to sync

**HTTP errors**: Check that your Access URL is correct and hasn't expired

## SimpleFIN Pricing

- $2/month per bank connection (billed annually: $24/year)
- No business registration required
- No review process
- Cancel anytime

## CLI Commands

Single executable binary (compiled with Bun):

```bash
budget-skill <command> [options]

Commands:
  setup                 Initialize data directories
  accounts              Fetch connected bank accounts
  fetch                 Fetch and categorize transactions
  budget set            Set budget limits
  budget status         Check spending vs budgets
  report                Generate spending reports
  
Options:
  --help                Show help
  --version             Show version
```

Install globally: `sudo mv budget-skill /usr/local/bin/budget-skill`
