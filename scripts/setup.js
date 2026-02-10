const { ensureDataDir, DATA_DIR, saveJson } = require('./utils');
const path = require('path');
const fs = require('fs').promises;

async function main() {
  try {
    console.log('Setting up SimpleFIN budget skill...');
    
    // Create data directories
    await ensureDataDir();
    console.log(`✓ Created data directory: ${DATA_DIR}`);
    
    // Copy config template
    const configTemplatePath = path.join(__dirname, '..', 'assets', 'config_template.json');
    const configPath = path.join(DATA_DIR, 'config.json');
    
    const configExists = await fs.access(configPath).then(() => true).catch(() => false);
    if (!configExists) {
      const template = require(configTemplatePath);
      await saveJson(configPath, template);
      console.log(`✓ Created config.json (add your SimpleFIN Access URL here)`);
    } else {
      console.log(`✓ config.json already exists`);
    }
    
    // Copy budget template
    const budgetTemplatePath = path.join(__dirname, '..', 'assets', 'budget_template.json');
    const budgetPath = path.join(DATA_DIR, 'budgets.json');
    
    const budgetExists = await fs.access(budgetPath).then(() => true).catch(() => false);
    if (!budgetExists) {
      const template = require(budgetTemplatePath);
      await saveJson(budgetPath, template);
      console.log(`✓ Created budgets.json with defaults`);
    } else {
      console.log(`✓ budgets.json already exists`);
    }
    
    console.log('\n✅ Setup complete!');
    console.log(`\nNext steps:`);
    console.log(`1. Sign up at https://beta-bridge.simplefin.org/`);
    console.log(`2. Connect your bank and get your Access URL`);
    console.log(`3. Edit ${configPath} and paste your Access URL`);
    console.log(`4. Run: node scripts/fetch_accounts.js`);
    console.log(`5. Run: node scripts/fetch_transactions.js --days 30`);
    
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
}

main();
