const { loadJson, handleError, DATA_DIR } = require('./utils');
const path = require('path');

async function main() {
  try {
    const args = process.argv.slice(2);
    const accessToken = args.find(arg => arg.startsWith('--access_token='))?.split('=')[1];
    const period = args.find(arg => arg.startsWith('--period='))?.split('=')[1] || 'monthly';
    
    if (!accessToken) {
      console.error('Usage: node budget_status.js --access_token=<token> [--period=monthly]');
      process.exit(1);
    }
    
    // Load budgets
    const budgetPath = path.join(DATA_DIR, 'budgets.json');
    const budgets = await loadJson(budgetPath);
    
    if (!budgets || !budgets[period]) {
      console.error(`No ${period} budgets set. Run: node set_budget.js`);
      process.exit(1);
    }
    
    // Load transactions
    const txnPath = path.join(DATA_DIR, 'transactions', `${accessToken.slice(0, 10)}.json`);
    const transactions = await loadJson(txnPath);
    
    if (!transactions) {
      console.error('No transactions found. Run: node fetch_transactions.js');
      process.exit(1);
    }
    
    // Calculate current period spending
    const now = new Date();
    const periodStart = period === 'monthly' 
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const currentTxns = transactions.filter(txn => new Date(txn.date) >= periodStart);
    
    const spending = {};
    currentTxns.forEach(txn => {
      spending[txn.category] = (spending[txn.category] || 0) + txn.amount;
    });
    
    console.log(`\n${period.toUpperCase()} BUDGET STATUS\n${'='.repeat(50)}\n`);
    
    Object.entries(budgets[period]).forEach(([category, limit]) => {
      const spent = spending[category] || 0;
      const remaining = limit - spent;
      const percentage = (spent / limit * 100).toFixed(1);
      
      console.log(`${category}:`);
      console.log(`  Spent: $${spent.toFixed(2)} / $${limit.toFixed(2)} (${percentage}%)`);
      console.log(`  Remaining: $${remaining.toFixed(2)}`);
      console.log(`  Status: ${remaining < 0 ? '⚠️  OVER BUDGET' : '✓ On track'}\n`);
    });
    
  } catch (error) {
    handleError(error);
  }
}

main();
