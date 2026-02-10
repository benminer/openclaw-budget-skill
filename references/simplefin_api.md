# SimpleFIN API Reference

## Authentication

SimpleFIN uses a single **Access URL** that contains your authentication token. This URL is obtained from the SimpleFIN Bridge web interface after connecting your banks.

Example Access URL:
```
https://bridge.simplefin.org/simplefin/<your_token>
```

This URL is both your base URL and authentication. No separate API keys needed.

## Endpoints

All endpoints are accessed by making GET requests to your Access URL + endpoint path.

### GET /accounts

Fetch all connected accounts.

**Request:**
```bash
curl "https://bridge.simplefin.org/simplefin/<your_token>/accounts"
```

**Response:**
```json
{
  "accounts": [
    {
      "id": "account_id",
      "name": "Checking",
      "currency": "USD",
      "balance": 125043,
      "available-balance": 125043,
      "org": {
        "name": "Bank Name",
        "domain": "bank.com"
      }
    }
  ]
}
```

**Note:** Balances are in cents (divide by 100 for dollars).

### GET /?start-date=<unix>&end-date=<unix>

Fetch transactions for all accounts within a date range.

**Request:**
```bash
curl "https://bridge.simplefin.org/simplefin/<your_token>?start-date=1704067200&end-date=1707436800"
```

**Parameters:**
- `start-date`: Unix timestamp (seconds since epoch)
- `end-date`: Unix timestamp (seconds since epoch)

**Response:**
```json
{
  "accounts": [
    {
      "id": "account_id",
      "name": "Checking",
      "transactions": [
        {
          "id": "txn_id",
          "posted": 1706745600,
          "amount": -4299,
          "description": "STARBUCKS #12345",
          "memo": "Card ending in 1234"
        }
      ]
    }
  ]
}
```

**Transaction fields:**
- `posted`: Unix timestamp when transaction posted
- `amount`: Amount in cents (negative = money out, positive = money in)
- `description`: Merchant/payee name
- `memo`: Additional details (optional)

## Data Format

- **Currency amounts**: Always in cents (integer)
- **Dates**: Unix timestamps (seconds since Jan 1, 1970)
- **Account balances**: Includes `balance` (current) and `available-balance` (spendable)

## Error Handling

HTTP status codes:
- `200 OK`: Success
- `401 Unauthorized`: Invalid or expired Access URL
- `404 Not Found`: Endpoint doesn't exist
- `500 Internal Server Error`: SimpleFIN API issue

## Rate Limits

SimpleFIN doesn't publish explicit rate limits, but be reasonable:
- Don't poll more than once per hour
- Cache transaction data locally
- Batch requests when possible

## Security

- **Never share your Access URL** — it contains your authentication token
- Store it in config.json (local file, not in code)
- Regenerate from SimpleFIN Bridge if compromised

## Official Documentation

- SimpleFIN Bridge: https://beta-bridge.simplefin.org/
- API Docs: https://beta-bridge.simplefin.org/info/api
- Pricing: $2/month per bank connection (billed annually)

## Example Usage (Node.js)

```javascript
const https = require('https');

async function fetchAccounts(accessUrl) {
  const url = new URL(accessUrl + '/accounts');
  
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}
```

See `scripts/utils.js` for full implementation.
