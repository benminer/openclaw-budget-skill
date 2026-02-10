---
name: plaid-budget
description: Plaid API integration for transaction tracking, spending categorization, budgeting, and financial reports. Supports sandbox testing and production Link flow. Use when user requests: connect bank account, fetch transactions, categorize spending, set/track budgets, review spending, or generate financial reports. Requires Plaid API keys in config.json.
---

# Plaid Budget Skill

Connect to bank accounts via Plaid API, fetch transactions, categorize spending, set budgets, and generate spending reports.

## Quick Start

1. **Setup**: Initialize data directory and install dependencies
   ```bash
   node scripts/setup.js
   ```

2. **Configure**: Edit `~/.openclaw/workspace/data/plaid/config.json` with your Plaid keys
   ```json
   {
     "client_id": "your_client_id",
     "sandbox_secret": "your_sandbox_secret"
   }
   ```

3. **Connect Account** (Sandbox):
   ```bash
   node scripts/auth_sandbox.js --institution_id=ins_56
   ```

4. **Fetch Transactions**:
   ```bash
   node scripts/fetch_transactions.js --access_token=<token> --days=30
   ```

5. **View Report**:
   ```bash
   node scripts/report.js --access_token=<token> --period=monthly
   ```

## Core Workflows

### Bank Account Connection

**Sandbox (Testing)**:
- Uses test bank credentials (no real bank connection)
- `node scripts/auth_sandbox.js --institution_id=ins_56`
- Test institution: Tartan Bank (ins_56) with username `user_good`, password `pass_good`

**Production** (Not yet implemented):
- Requires Link token generation and user browser flow
- See `references/plaid_api.md` for details

### Transaction Management

**Fetch transactions**:
```bash
node scripts/fetch_transactions.js --access_token=<token> --days=30
```
- Fetches last 30 days (or specify --days=90 for 90 days)
- Auto-categorizes using Plaid's Personal Finance Categories
- Saves to `data/plaid/transactions/<token>.json`

### Budget Tracking

**Set a budget**:
```bash
node scripts/set_budget.js --category=FOOD_AND_DRINK --limit=500 --period=monthly
```

**Check budget status**:
```bash
node scripts/budget_status.js --access_token=<token> --period=monthly
```
- Shows spending vs budget for current period
- Highlights categories over budget

### Spending Reports

```bash
node scripts/report.js --access_token=<token> --period=monthly
```
- Total spending by category
- Top 10 merchants
- Transaction counts and trends

Periods: `monthly` (current calendar month) or `weekly` (last 7 days)

## Data Storage

All data stored in: `~/.openclaw/workspace/data/plaid/`

- `config.json` - API credentials
- `access_tokens/<institution>.json` - Saved access tokens per bank
- `transactions/<token>.json` - Cached transactions (categorized)
- `budgets.json` - Budget limits by category and period

## Categories

Plaid Personal Finance Categories (primary):
- FOOD_AND_DRINK
- TRANSPORTATION
- GENERAL_MERCHANDISE
- ENTERTAINMENT
- PERSONAL_CARE
- TRAVEL
- INCOME
- TRANSFER_IN/TRANSFER_OUT
- LOAN_PAYMENTS
- BANK_FEES

Custom category rules can be added to `assets/category_rules.json`

## Troubleshooting

**"Config not found"**: Run `node scripts/setup.js` first

**"No transactions found"**: Run `fetch_transactions.js` to sync

**"ITEM_LOGIN_REQUIRED"**: Access token expired, need to re-authenticate

**API errors**: Check `references/plaid_api.md` for common errors and solutions

## References

- **API Documentation**: See `references/plaid_api.md` for endpoint details
- **Sandbox Testing**: Test credentials and institutions in API docs
- **Official Docs**: https://plaid.com/docs/

## Scripts

- `setup.js` - Initialize data directories and install dependencies
- `auth_sandbox.js` - Connect sandbox account
- `fetch_transactions.js` - Fetch and categorize transactions
- `set_budget.js` - Set budget limits
- `budget_status.js` - Check spending vs budgets
- `report.js` - Generate spending reports
- `utils.js` - Shared utilities (Plaid client, file I/O, error handling)
