import https from 'https';
import fs from 'fs/promises';
import path from 'path';

export const DATA_DIR = path.join(process.env.HOME!, '.openclaw', 'workspace', 'data', 'simplefin');

interface SimpleFINConfig {
  access_url: string;
}

interface SimpleFINAccount {
  id: string;
  name: string;
  currency: string;
  balance: string;
  'available-balance': string;
  'balance-date': number;
  transactions: SimpleFINTransaction[];
  holdings: any[];
  org: {
    domain: string;
    name: string;
    'sfin-url': string;
    url: string;
    id: string;
  };
}

interface SimpleFINTransaction {
  id: string;
  posted: number;
  amount: string;
  description: string;
  payee?: string;
  memo?: string;
  transacted_at: number;
}

export async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(path.join(DATA_DIR, 'accounts'), { recursive: true });
  await fs.mkdir(path.join(DATA_DIR, 'transactions'), { recursive: true });
}

export async function loadConfig(): Promise<SimpleFINConfig> {
  const configPath = path.join(DATA_DIR, 'config.json');
  try {
    const data = await fs.readFile(configPath, 'utf8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new Error(`Config not found. Run setup.js first.`);
    }
    throw error;
  }
}

export async function simplefinRequest(accessUrl: string, endpoint: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = new URL(accessUrl);
    const fullPath = url.pathname + (endpoint || '');
    
    // Extract Basic Auth credentials from URL
    const auth = url.username && url.password 
      ? Buffer.from(`${url.username}:${url.password}`).toString('base64')
      : null;
    
    const options: https.RequestOptions = {
      hostname: url.hostname,
      port: url.port || 443,
      path: fullPath + (url.search || ''),
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    };
    
    if (auth) {
      options.headers!['Authorization'] = `Basic ${auth}`;
    }
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
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

export async function loadJson<T = any>(filePath: string): Promise<T | null> {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

export async function saveJson(filePath: string, data: any): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export function printJson(data: any): void {
  console.log(JSON.stringify(data, null, 2));
}

export function handleError(error: any): void {
  console.error('Error:', error.message);
  if (error.response) {
    console.error('Response:', error.response);
  }
  process.exit(1);
}
