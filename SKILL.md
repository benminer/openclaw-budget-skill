---
name: budget-skill
description: SimpleFIN API integration for transaction tracking, spending categorization, budgeting, and financial reports. Use when user requests: connect bank account, fetch transactions, categorize spending, set/track budgets, review spending, or generate financial reports. Guide users through SimpleFIN setup, help generate personalized merchant rules, run budget commands, and provide spending analysis.
---

# Budget Skill for Agents

This skill helps users connect their bank accounts, track spending, set budgets, and review transactions. Your role is to guide them through setup and use the skill to provide financial insights.

## When to Use This Skill

Trigger when users ask about:
- Connecting bank accounts
- Tracking spending or transactions
- Setting or checking budgets
- Reviewing recent purchases
- Generating spending reports
- Financial accountability or savings goals

## User Setup Flow

### Step 1: SimpleFIN Account Creation

Guide the user to sign up for SimpleFIN ($2/month per bank):

1. "Go to https://beta-bridge.simplefin.org/"
2. "Click 'Create a SimpleFIN Bridge' and enter your email"
3. "You'll get a Setup Token (base64 string) — paste it here"

When they provide the token:
- Base64 decode it to get the claim URL
- Make a POST request to the claim URL to get the permanent Access URL
- Save this Access URL for the next step

### Step 2: Bank Connection

"Now connect your bank accounts via SimpleFIN's web interface:"
1. "Visit the setup URL from SimpleFIN"
2. "Search for your bank and enter your credentials"
3. "SimpleFIN will securely connect to your accounts"

This happens in their browser — you don't need to do anything.

### Step 3: Skill Installation

Run the setup:
```bash
budget-skill setup
```

This creates:
- Data directory: `~/.openclaw/workspace/data/simplefin/`
- Config file: `config.json`
- Budget file: `budgets.json`

### Step 4: Configure Access

Edit the config file with the Access URL from Step 1:
```bash
# Write to ~/.openclaw/workspace/data/simplefin/config.json
{
  "access_url": "https://USER:PASS@beta-bridge.simplefin.org/simplefin"
}
```

### Step 5: Test Connection

```bash
budget-skill accounts
```

Should list all connected accounts with balances. If successful, guide them to fetch transactions:

```bash
budget-skill fetch --days 30
```

## Personalized Merchant Rules

After initial setup, help users create personalized categorization rules.

### Generate Personal Categories

1. Fetch recent transactions: `budget-skill fetch --days 30`
2. Load transaction data: `~/.openclaw/workspace/data/simplefin/transactions/transactions.json`
3. Analyze recurring merchants, identify:
   - Car loans (track balance)
   - Subscriptions (monthly/annual)
   - Personal services (gym, trainer)
   - Payment plans
   - Specific merchant names vs generic transfers
4. Create `workspace/skills/budget-skill/personal-categories.json` with:
   - Merchant-specific rules
   - Category mappings
   - Balance tracking (for loans)
   - Notes about frequency

**Template structure:**
```json
{
  "merchant_rules": {
    "MERCHANT NAME": {
      "category": "CATEGORY",
      "notes": "Description",
      "frequency": "monthly",
      "track_balance": true,
      "current_balance": 0.00,
      "last_updated": "YYYY-MM-DD"
    }
  },
  "category_descriptions": { ... }
}
```

See `personal-categories.example.json` in the skill directory for full template.

### Financial Context File (Optional)

For deeper context (especially for financial accountability), create:
`workspace/skills/budget-skill/financial-context.md`

Include:
- User's financial goals (saving for house, paying off debt, etc.)
- Recurring payment details
- Known merchant mappings
- Budget preferences
- Account balance history

**Always read this file before generating reports** to provide personalized, contextual advice.

## Core Commands

All commands use the global `budget-skill` binary.

### Fetch Accounts
```bash
budget-skill accounts
```
Returns all connected accounts with current balances. Run this before generating reports to get fresh data.

### Fetch Transactions
```bash
budget-skill fetch --days 30
```
Pulls transactions from the last N days. SimpleFIN returns transactions nested in account responses, so this extracts and categorizes them.

**Note:** First-time bank connections may take 24 hours to populate transaction history.

### Set Budget
```bash
budget-skill budget set --category FOOD_AND_DRINK --limit 500 --period monthly
```
Creates spending limits. Available periods: `monthly`, `weekly`

### Check Budget Status
```bash
budget-skill budget status --period monthly
```
Compares actual spending vs budgets for current period. Highlights over-budget categories.

### Generate Report
```bash
budget-skill report --period weekly
```
Shows spending breakdown by category, top merchants, and totals. Available periods: `weekly`, `monthly`

## Providing Financial Insights

When analyzing spending:

1. **Read context first:** Check `financial-context.md` if it exists for user goals and preferences
2. **Categorize accurately:** Use personal rules to identify specific merchants
3. **Flag wasteful spending:** Highlight food delivery, expensive meals, unused subscriptions
4. **Quantify impact:** Show how cutting expenses affects savings goals
5. **Be specific:** "Uber Eats $45 this week" not "delivery expenses increased"

### Report Structure

**Weekly/Monthly Reports:**
- Total spending by category
- Current account balances
- Top merchants
- Flags for wasteful spending
- Actionable recommendations

**Daily Reviews:**
- List today's transactions
- Updated balances
- Flag suspicious or unusual charges
- Call out impulse purchases

### Budget Accountability

If user has set financial goals (in `financial-context.md` or `BUDGET.md`):
- Evaluate ALL spending through that lens
- Calculate impact on savings goal (e.g., "$50 delivery = $50 less for down payment")
- Be direct about wasteful spending
- Track progress toward goals

## Spending Categories

**Personalized Categories** (from `personal-categories.json`):
- AUTO_LOAN - Car loan payments (track balance)
- SUBSCRIPTIONS - Software/services
- CREDIT_CARD_PAYMENT - Credit card autopay
- SAVINGS - Investment contributions
- PERSONAL_SERVICES - Personal trainer, services
- PAYMENT_PLANS - Installment payments

**Generic Categories** (fallback):
- FOOD_AND_DRINK
- TRANSPORTATION
- GENERAL_MERCHANDISE
- ENTERTAINMENT
- PERSONAL_CARE
- TRAVEL
- UTILITIES
- HOUSING
- TRANSFER
- UNCATEGORIZED

## Data Storage

All data lives in: `~/.openclaw/workspace/data/simplefin/`

- `config.json` - SimpleFIN Access URL (contains credentials)
- `accounts/accounts.json` - Connected accounts
- `transactions/transactions.json` - Categorized transactions
- `budgets.json` - Budget limits by category

**Security:** All data is local. Access URL acts as password — never expose it.

## Troubleshooting

**"Config not found"**  
→ Run `budget-skill setup` first

**"No transactions found"**  
→ Run `budget-skill fetch --days 30`

**Empty transactions for a bank**  
→ Some banks take 24 hours to sync. Check again tomorrow.

**Balance showing as cents instead of dollars**  
→ SimpleFIN returns balances as dollar strings, not cents. CLI should parse as-is.

**"Please add your SimpleFIN Access URL"**  
→ Config file is missing the Access URL or still has placeholder text

## Automated Reports

For recurring budget reviews, set up cron jobs:

**Weekly Report (Sunday 7 PM):**
```javascript
{
  "schedule": {"kind": "cron", "expr": "0 19 * * 0", "tz": "America/Chicago"},
  "payload": {
    "kind": "agentTurn",
    "message": "Generate weekly budget report:\n1. Read financial-context.md\n2. Run: budget-skill accounts\n3. Run: budget-skill fetch --days 7\n4. Run: budget-skill report --period weekly\n5. Analyze spending, flag waste, provide recommendations"
  }
}
```

**Daily Review (10 PM):**
```javascript
{
  "schedule": {"kind": "cron", "expr": "0 22 * * *", "tz": "America/Chicago"},
  "payload": {
    "kind": "agentTurn",
    "message": "Daily transaction review:\n1. Read financial-context.md\n2. Run: budget-skill accounts\n3. Review today's transactions\n4. Flag suspicious or wasteful spending"
  }
}
```

## Best Practices

1. **Always fetch fresh data** before generating reports
2. **Read financial-context.md** for personalized insights
3. **Update personal-categories.json** when new recurring merchants appear
4. **Track loan balances** and report progress when payments appear
5. **Be specific in recommendations** — "Cut Uber Eats" not "reduce food spending"
6. **Respect user goals** — if saving for a house, evaluate all spending through that lens

## Example Workflow

**User asks:** "How much did I spend this week?"

1. `budget-skill accounts` (refresh balances)
2. `budget-skill fetch --days 7` (get recent transactions)
3. `budget-skill report --period weekly` (generate report)
4. Read `financial-context.md` (if exists)
5. Analyze output:
   - Summarize spending by category
   - Show top merchants
   - Flag wasteful spending (food delivery, impulse buys)
   - Compare to budget (if set)
   - Provide actionable recommendations
6. Present findings in conversational format

## References

- SimpleFIN API: https://beta-bridge.simplefin.org/info/api
- Repository: https://github.com/benminer/openclaw-budget-skill
- Setup Guide: See README.md in skill directory
