#!/usr/bin/env bun

import yargs from 'yargs';
import path from 'path';
import { ensureDataDir, loadConfig, loadJson, saveJson, simplefinRequest, printJson, handleError, DATA_DIR } from './scripts/utils';

const hideBin = (argv: string[]) => argv.slice(2);

interface Transaction {
  id: string;
  date: string;
  amount: number;
  merchant_name: string;
  category: string;
  account_name: string;
  account_org: string;
}

// Setup command
async function setup(): Promise<void> {
  try {
    console.log('Setting up SimpleFIN budget skill...');
    
    await ensureDataDir();
    console.log(`✓ Created data directory: ${DATA_DIR}`);
    
    const configPath = path.join(DATA_DIR, 'config.json');
    const configExists = await Bun.file(configPath).exists();
    
    if (!configExists) {
      const template = { access_url: 'YOUR_SIMPLEFIN_ACCESS_URL' };
      await saveJson(configPath, template);
      console.log(`✓ Created config.json (add your SimpleFIN Access URL here)`);
    } else {
      console.log(`✓ config.json already exists`);
    }
    
    const budgetPath = path.join(DATA_DIR, 'budgets.json');
    const budgetExists = await Bun.file(budgetPath).exists();
    
    if (!budgetExists) {
      const template = require('./assets/budget_template.json');
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
    console.log(`4. Run: budget-skill accounts`);
    console.log(`5. Run: budget-skill fetch --days 30`);
    
  } catch (error) {
    handleError(error);
  }
}

// Fetch accounts
async function fetchAccounts(): Promise<void> {
  try {
    console.log('Fetching accounts from SimpleFIN...');
    
    const config = await loadConfig();
    const accessUrl = config.access_url;
    
    if (!accessUrl || accessUrl === 'YOUR_SIMPLEFIN_ACCESS_URL') {
      console.error('Please add your SimpleFIN Access URL to config.json');
      process.exit(1);
    }
    
    const response = await simplefinRequest(accessUrl, '/accounts');
    const accounts = response.accounts || [];
    
    console.log(`✓ Fetched ${accounts.length} accounts`);
    
    const accountsPath = path.join(DATA_DIR, 'accounts', 'accounts.json');
    await saveJson(accountsPath, accounts);
    console.log(`✓ Saved to: ${accountsPath}`);
    
    console.log('\nAccounts:');
    accounts.forEach(acc => {
      const balance = parseFloat(acc.balance);
      console.log(`  - ${acc.name} (${acc.org.name}): $${balance.toFixed(2)}`);
    });
    
  } catch (error) {
    handleError(error);
  }
}

// Fetch transactions
async function fetchTransactions(days: number = 30): Promise<void> {
  try {
    const accountsPath = path.join(DATA_DIR, 'accounts', 'accounts.json');
    const accounts = await loadJson(accountsPath);
    
    if (!accounts) {
      console.error('No accounts found. Run: budget-skill accounts');
      process.exit(1);
    }
    
    let allTransactions = [];
    accounts.forEach(account => {
      if (account.transactions) {
        account.transactions.forEach(txn => {
          allTransactions.push({
            id: txn.id,
            date: new Date(txn.posted * 1000).toISOString().split('T')[0],
            amount: Math.abs(parseFloat(txn.amount)),
            merchant_name: txn.description,
            category: categorizeTransaction(txn.description),
            account_name: account.name,
            account_org: account.org.name,
          });
        });
      }
    });
    
    console.log(`✓ Processed ${allTransactions.length} transactions from ${accounts.length} accounts`);
    
    const txnPath = path.join(DATA_DIR, 'transactions', 'transactions.json');
    await saveJson(txnPath, allTransactions);
    console.log(`✓ Saved to: ${txnPath}`);
    
    const summary = {};
    allTransactions.forEach(txn => {
      summary[txn.category] = (summary[txn.category] || 0) + txn.amount;
    });
    
    console.log(`\nSummary by category:`);
    printJson(summary);
    
  } catch (error) {
    handleError(error);
  }
}

interface PersonalCategoryRule {
  category: string;
  notes: string;
  frequency?: string;
  track_balance?: boolean;
  current_balance?: number;
  last_updated?: string;
  merchant_name?: string;
}

interface PersonalCategories {
  merchant_rules: Record<string, PersonalCategoryRule>;
  category_descriptions: Record<string, string>;
}

function categorizeTransaction(description: string): string {
  const desc = description.toLowerCase();
  
  // Load personal category rules
  const personalRules: PersonalCategories = require('./personal-categories.json');
  
  // Check personal merchant rules first
  for (const [merchant, rule] of Object.entries(personalRules.merchant_rules)) {
    if (desc.includes(merchant.toLowerCase())) {
      return rule.category;
    }
  }
  
  // Fallback to generic rules
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

// Set budget
async function setBudget(category: string, limit: number, period: string = 'monthly'): Promise<void> {
  try {
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

// Budget status
async function budgetStatus(period: string = 'monthly'): Promise<void> {
  try {
    const budgetPath = path.join(DATA_DIR, 'budgets.json');
    const budgets = await loadJson(budgetPath);
    
    if (!budgets || !budgets[period]) {
      console.error(`No ${period} budgets set. Run: budget-skill budget set`);
      process.exit(1);
    }
    
    const txnPath = path.join(DATA_DIR, 'transactions', 'transactions.json');
    const transactions = await loadJson(txnPath);
    
    if (!transactions) {
      console.error('No transactions found. Run: budget-skill fetch');
      process.exit(1);
    }
    
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

// Generate report
async function report(period: string = 'monthly'): Promise<void> {
  try {
    const txnPath = path.join(DATA_DIR, 'transactions', 'transactions.json');
    const transactions = await loadJson(txnPath);
    
    if (!transactions) {
      console.error('No transactions found. Run: budget-skill fetch');
      process.exit(1);
    }
    
    const now = new Date();
    const periodStart = period === 'monthly'
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const periodTxns = transactions.filter(txn => new Date(txn.date) >= periodStart);
    
    const byCategory = {};
    let totalSpent = 0;
    
    periodTxns.forEach(txn => {
      byCategory[txn.category] = (byCategory[txn.category] || 0) + txn.amount;
      totalSpent += txn.amount;
    });
    
    const byMerchant = {};
    periodTxns.forEach(txn => {
      if (txn.merchant_name) {
        byMerchant[txn.merchant_name] = (byMerchant[txn.merchant_name] || 0) + txn.amount;
      }
    });
    
    const topMerchants = Object.entries(byMerchant)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
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

// CLI setup
yargs(hideBin(process.argv))
  .command('setup', 'Initialize data directory and config', {}, setup)
  .command('accounts', 'Fetch connected bank accounts', {}, fetchAccounts)
  .command('fetch', 'Fetch and categorize transactions', {
    days: {
      type: 'number',
      default: 30,
      describe: 'Number of days to fetch',
    },
  }, (argv) => fetchTransactions(argv.days))
  .command('budget', 'Manage budgets', (yargs) => {
    yargs
      .command('set', 'Set a budget limit', {
        category: {
          type: 'string',
          demandOption: true,
          describe: 'Budget category',
        },
        limit: {
          type: 'number',
          demandOption: true,
          describe: 'Budget limit amount',
        },
        period: {
          type: 'string',
          default: 'monthly',
          choices: ['monthly', 'weekly'],
          describe: 'Budget period',
        },
      }, (argv) => setBudget(argv.category, argv.limit, argv.period))
      .command('status', 'Check budget status', {
        period: {
          type: 'string',
          default: 'monthly',
          choices: ['monthly', 'weekly'],
          describe: 'Budget period',
        },
      }, (argv) => budgetStatus(argv.period))
      .demandCommand(1, 'You must specify a budget subcommand');
  })
  .command('report', 'Generate spending report', {
    period: {
      type: 'string',
      default: 'monthly',
      choices: ['monthly', 'weekly'],
      describe: 'Report period',
    },
  }, (argv) => report(argv.period))
  .demandCommand(1, 'You must specify a command')
  .help()
  .argv;
