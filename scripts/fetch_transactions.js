const { loadConfig, initClient, loadJson, saveJson, printJson, handleError, DATA_DIR } = require('./utils');
const path = require('path');

async function main() {
  try {
    const args = process.argv.slice(2);
    const accessToken = args.find(arg => arg.startsWith('--access_token='))?.split('=')[1];
    const days = parseInt(args.find(arg => arg.startsWith('--days='))?.split('=')[1] || '30');
    
    if (!accessToken) {
      console.error('Usage: node fetch_transactions.js --access_token=<token> [--days=30]');
      process.exit(1);
    }
    
    const config = await loadConfig();
    const client = initClient(config);
    
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    console.log(`Fetching transactions from ${startDate} to ${endDate}...`);
    
    let allTransactions = [];
    let hasMore = true;
    let offset = 0;
    const count = 500;
    
    while (hasMore) {
      const response = await client.transactionsGet({
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
        options: {
          count,
          offset,
        },
      });
      
      const { transactions, total_transactions } = response.data;
      allTransactions = allTransactions.concat(transactions);
      
      offset += transactions.length;
      hasMore = offset < total_transactions;
      
      console.log(`✓ Fetched ${allTransactions.length}/${total_transactions} transactions`);
    }
    
    // Categorize transactions
    const categorized = allTransactions.map(txn => ({
      id: txn.transaction_id,
      date: txn.date,
      amount: txn.amount,
      merchant_name: txn.merchant_name || txn.name,
      category: txn.personal_finance_category?.primary || 'UNCATEGORIZED',
      detailed_category: txn.personal_finance_category?.detailed || '',
    }));
    
    // Save transactions
    const txnPath = path.join(DATA_DIR, 'transactions', `${accessToken.slice(0, 10)}.json`);
    await saveJson(txnPath, categorized);
    
    console.log(`✓ Saved ${categorized.length} transactions to: ${txnPath}`);
    console.log(`\nSummary by category:`);
    
    const summary = {};
    categorized.forEach(txn => {
      summary[txn.category] = (summary[txn.category] || 0) + txn.amount;
    });
    
    printJson(summary);
    
  } catch (error) {
    handleError(error);
  }
}

main();
