const { ensureDataDir, DATA_DIR, saveJson } = require('./utils');
const path = require('path');
const fs = require('fs').promises;
const { execSync } = require('child_process');

async function main() {
  try {
    console.log('Setting up plaid-budget skill...');
    
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
      console.log(`✓ Created config.json (add your Plaid keys here)`);
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
    
    // Install dependencies
    console.log('Installing dependencies (plaid)...');
    try {
      execSync('npm install plaid', { cwd: __dirname, stdio: 'inherit' });
      console.log('✓ Dependencies installed');
    } catch (error) {
      console.error('Failed to install dependencies. Run: npm install plaid');
    }
    
    console.log('\n✅ Setup complete!');
    console.log(`\nNext steps:`);
    console.log(`1. Edit ${configPath} with your Plaid sandbox keys`);
    console.log(`2. Run: node scripts/auth_sandbox.js --institution_id ins_56`);
    console.log(`3. Run: node scripts/fetch_transactions.js --days 30`);
    
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
}

main();
