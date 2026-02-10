const { loadConfig, simplefinRequest, saveJson, printJson, handleError, DATA_DIR } = require('./utils');
const path = require('path');

async function main() {
  try {
    console.log('Fetching accounts from SimpleFIN...');
    
    const config = await loadConfig();
    const accessUrl = config.access_url;
    
    if (!accessUrl || accessUrl === 'YOUR_SIMPLEFIN_ACCESS_URL') {
      console.error('Please add your SimpleFIN Access URL to config.json');
      process.exit(1);
    }
    
    // Fetch accounts
    const response = await simplefinRequest(accessUrl, '/accounts');
    
    const accounts = response.accounts || [];
    console.log(`✓ Fetched ${accounts.length} accounts`);
    
    // Save accounts
    const accountsPath = path.join(DATA_DIR, 'accounts', 'accounts.json');
    await saveJson(accountsPath, accounts);
    console.log(`✓ Saved to: ${accountsPath}`);
    
    console.log('\nAccounts:');
    accounts.forEach(acc => {
      console.log(`  - ${acc.name} (${acc.org.name}): $${(acc.balance / 100).toFixed(2)}`);
    });
    
    printJson(accounts);
    
  } catch (error) {
    handleError(error);
  }
}

main();
