const { loadJson, handleError, DATA_DIR } = require('./utils');
const path = require('path');

async function main() {
  try {
    const args = process.argv.slice(2);
    const accessToken = args.find(arg => arg.startsWith('--access_token='))?.split('=')[1];
    const period = args.find(arg => arg.startsWith('--period='))?.split('=')[1] || 'monthly';
    
    if (!accessToken) {
      console.error('Usage: node report.js --access_token=<token> [--period=monthly|weekly]');
      process.exit(1);
    }
    
    // Load transactions
    const txnPath = path.join(DATA_DIR, 'transactions', `${accessToken.slice(0, 10)}.json`);
    const transactions = await loadJson(txnPath);
    
    if (!transactions) {
      console.error('No transactions found. Run: node fetch_transactions.js');
      process.exit(1);
    }
    
    // Filter by period
    const now = new Date();
    const periodStart = period === 'monthly'
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const periodTxns = transactions.filter(txn => new Date(txn.date) >= periodStart);
    
    // Calculate totals by category
    const byCategory = {};
    let totalSpent = 0;
    
    periodTxns.forEach(txn => {
      byCategory[txn.category] = (byCategory[txn.category] || 0) + txn.amount;
      totalSpent += txn.amount;
    });
    
    // Top merchants
    const byMerchant = {};
    periodTxns.forEach(txn => {
      if (txn.merchant_name) {
        byMerchant[txn.merchant_name] = (byMerchant[txn.merchant_name] || 0) + txn.amount;
      }
    });
    
    const topMerchants = Object.entries(byMerchant)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    // Print report
    console.log(`\n${period.toUpperCase()} SPENDING REPORT`);
    console.log(`${'='.repeat(50)}\n`);
    console.log(`Period: ${periodStart.toISOString().split('T')[0]} to ${now.toISOString().split('T')[0]}`);
    console.log(`Total transactions: ${periodTxns.length}`);
    console.log(`Total spent: $${totalSpent.toFixed(2)}\n`);
    
    console.log(`SPENDING BY CATEGORY:\n`);
    Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, amount]) => {
        const percentage = (amount / totalSpent * 100).toFixed(1);
        console.log(`  ${category}: $${amount.toFixed(2)} (${percentage}%)`);
      });
    
    console.log(`\nTOP 10 MERCHANTS:\n`);
    topMerchants.forEach(([merchant, amount], i) => {
      console.log(`  ${i + 1}. ${merchant}: $${amount.toFixed(2)}`);
    });
    
  } catch (error) {
    handleError(error);
  }
}

main();
