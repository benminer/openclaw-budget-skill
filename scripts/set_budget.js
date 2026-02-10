const { loadJson, saveJson, handleError, DATA_DIR } = require('./utils');
const path = require('path');

async function main() {
  try {
    const args = process.argv.slice(2);
    const category = args.find(arg => arg.startsWith('--category='))?.split('=')[1];
    const limit = parseFloat(args.find(arg => arg.startsWith('--limit='))?.split('=')[1]);
    const period = args.find(arg => arg.startsWith('--period='))?.split('=')[1] || 'monthly';
    
    if (!category || !limit) {
      console.error('Usage: node set_budget.js --category=<name> --limit=<amount> [--period=monthly]');
      process.exit(1);
    }
    
    const budgetPath = path.join(DATA_DIR, 'budgets.json');
    let budgets = await loadJson(budgetPath) || {};
    
    if (!budgets[period]) {
      budgets[period] = {};
    }
    
    budgets[period][category] = limit;
    await saveJson(budgetPath, budgets);
    
    console.log(`✓ Set ${period} budget for ${category}: $${limit.toFixed(2)}`);
    console.log(`\nCurrent ${period} budgets:`);
    console.log(JSON.stringify(budgets[period], null, 2));
    
  } catch (error) {
    handleError(error);
  }
}

main();
