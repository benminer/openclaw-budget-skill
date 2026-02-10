const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(process.env.HOME, '.openclaw', 'workspace', 'data', 'plaid');

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(path.join(DATA_DIR, 'access_tokens'), { recursive: true });
  await fs.mkdir(path.join(DATA_DIR, 'transactions'), { recursive: true });
}

async function loadConfig() {
  const configPath = path.join(DATA_DIR, 'config.json');
  try {
    const data = await fs.readFile(configPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Config not found. Run setup.js first.`);
    }
    throw error;
  }
}

function initClient(config) {
  const configuration = new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': config.client_id,
        'PLAID-SECRET': config.sandbox_secret,
      },
    },
  });
  return new PlaidApi(configuration);
}

async function loadJson(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function saveJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

function handleError(error) {
  console.error('Error:', error.message);
  if (error.response) {
    console.error('Plaid response:', error.response.data);
  }
  process.exit(1);
}

module.exports = {
  DATA_DIR,
  ensureDataDir,
  loadConfig,
  initClient,
  loadJson,
  saveJson,
  printJson,
  handleError,
};
