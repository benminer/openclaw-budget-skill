# Plaid API Reference

## Authentication

### Sandbox Public Token Creation
```javascript
const response = await client.sandboxPublicTokenCreate({
  institution_id: 'ins_56', // Tartan Bank
  initial_products: ['transactions'],
});
```

### Token Exchange
```javascript
const response = await client.itemPublicTokenExchange({
  public_token: publicToken,
});
// Returns: { access_token, item_id }
```

## Transactions

### Fetch Transactions
```javascript
const response = await client.transactionsGet({
  access_token: accessToken,
  start_date: '2026-01-01',
  end_date: '2026-02-10',
  options: {
    count: 500,
    offset: 0,
  },
});
```

Response includes:
- `transaction_id`: Unique identifier
- `date`: Transaction date (ISO format)
- `amount`: Amount (positive = money out)
- `merchant_name`: Merchant name
- `personal_finance_category`: { primary, detailed, confidence }
- `category`: Legacy category IDs

## Personal Finance Categories

Primary categories:
- FOOD_AND_DRINK
- TRANSPORTATION
- GENERAL_MERCHANDISE
- ENTERTAINMENT
- PERSONAL_CARE
- TRAVEL
- INCOME
- TRANSFER_IN/OUT
- LOAN_PAYMENTS
- BANK_FEES

## Sandbox Testing

Test institution: `ins_56` (Tartan Bank)
- Username: `user_good`
- Password: `pass_good`

Base URL: https://sandbox.plaid.com

## Error Handling

Common errors:
- `ITEM_LOGIN_REQUIRED`: User needs to re-auth
- `INVALID_ACCESS_TOKEN`: Token expired or invalid
- `PRODUCT_NOT_READY`: Wait for initial transactions sync

See: https://plaid.com/docs/api/
