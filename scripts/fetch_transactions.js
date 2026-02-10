const { loadConfig, simplefinRequest, loadJson, saveJson, printJson, handleError, DATA_DIR } = require('./utils');
const path = require('path');

async function main() {
  try {
    const args = process.argv.slice(2);
    const days = parseInt(args.find(arg => arg.startsWith('--days='))?.split('=')[1] || '30');
    
    const config = await loadConfig();
    const accessUrl = config.access_url;
    
    if (!accessUrl || accessUrl === 'YOUR_SIMPLEFIN_ACCESS_URL') {
      console.error('Please add your SimpleFIN Access URL to config.json');
      process.exit(1);
    }
    
    const endDate = new Date();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const startDateStr = Math.floor(startDate.getTime() / 1000).toString();
    const endDateStr = Math.floor(endDate.getTime() / 1000).toString();
    
    console.log(`Fetching transactions from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}...`);
    
    // Fetch transactions with date range in URL
    const urlWithDates = `${accessUrl}?start-date=${startDateStr}&end-date=${endDateStr}`;
    const response = await simplefinRequest(urlWithDates, '');
    
    const accounts = response.accounts || [];
    let allTransactions = [];
    
    accounts.forEach(account => {
      if (account.transactions) {
        account.transactions.forEach(txn => {
          allTransactions.push({
            id: txn.id,
            date: new Date(txn.posted * 1000).toISOString().split('T')[0],
            amount: Math.abs(txn.amount / 100), // Convert cents to dollars
            merchant_name: txn.description,
            category: categorizeTransaction(txn.description),
            account_name: account.name,
            account_org: account.org.name,
          });
        });
      }
    });
    
    console.log(`✓ Fetched ${allTransactions.length} transactions from ${accounts.length} accounts`);
    
    // Save transactions
    const txnPath = path.join(DATA_DIR, 'transactions', 'transactions.json');
    await saveJson(txnPath, allTransactions);
    console.log(`✓ Saved to: ${txnPath}`);
    
    // Summary by category
    console.log(`\nSummary by category:`);
    const summary = {};
    allTransactions.forEach(txn => {
      summary[txn.category] = (summary[txn.category] || 0) + txn.amount;
    });
    
    printJson(summary);
    
  } catch (error) {
    handleError(error);
  }
}

function categorizeTransaction(description) {
  const desc = description.toLowerCase();
  
  // Simple keyword-based categorization
  if (desc.includes('grocery') || desc.includes('supermarket') || desc.includes('food')) {
    return 'FOOD_AND_DRINK';
  } else if (desc.includes('gas') || desc.includes('fuel') || desc.includes('uber') || desc.includes('lyft')) {
    return 'TRANSPORTATION';
  } else if (desc.includes('amazon') || desc.includes('target') || desc.includes('walmart')) {
    return 'GENERAL_MERCHANDISE';
  } else if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('movie') || desc.includes('theater')) {
    return 'ENTERTAINMENT';
  } else if (desc.includes('gym') || desc.includes('fitness') || desc.includes('salon')) {
    return 'PERSONAL_CARE';
  } else if (desc.includes('hotel') || desc.includes('airline') || desc.includes('airbnb')) {
    return 'TRAVEL';
  } else if (desc.includes('utility') || desc.includes('electric') || desc.includes('water') || desc.includes('internet')) {
    return 'UTILITIES';
  } else if (desc.includes('rent') || desc.includes('mortgage')) {
    return 'HOUSING';
  }
  
  return 'UNCATEGORIZED';
}

main();
