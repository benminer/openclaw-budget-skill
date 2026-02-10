const https = require('https');
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(process.env.HOME, '.openclaw', 'workspace', 'data', 'simplefin');

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(path.join(DATA_DIR, 'accounts'), { recursive: true });
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

async function simplefinRequest(accessUrl, endpoint) {
  return new Promise((resolve, reject) => {
    const url = new URL(accessUrl);
    const fullPath = url.pathname + (endpoint || '');
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: fullPath + (url.search || ''),
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
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
    console.error('Response:', error.response);
  }
  process.exit(1);
}

module.exports = {
  DATA_DIR,
  ensureDataDir,
  loadConfig,
  simplefinRequest,
  loadJson,
  saveJson,
  printJson,
  handleError,
};
