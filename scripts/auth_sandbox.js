const { loadConfig, initClient, saveJson, printJson, handleError, DATA_DIR } = require('./utils');
const path = require('path');

async function main() {
  try {
    const args = process.argv.slice(2);
    const institutionId = args.find(arg => arg.startsWith('--institution_id='))?.split('=')[1] || 'ins_56';
    
    console.log(`Creating sandbox access token for institution: ${institutionId}`);
    
    const config = await loadConfig();
    const client = initClient(config);
    
    // Create public token via sandbox
    const createResponse = await client.sandboxPublicTokenCreate({
      institution_id: institutionId,
      initial_products: ['transactions'],
      options: {
        webhook: '',
      },
    });
    
    const publicToken = createResponse.data.public_token;
    console.log('✓ Created public token');
    
    // Exchange for access token
    const exchangeResponse = await client.itemPublicTokenExchange({
      public_token: publicToken,
    });
    
    const { access_token, item_id } = exchangeResponse.data;
    
    // Save access token
    const tokenPath = path.join(DATA_DIR, 'access_tokens', `${institutionId}.json`);
    await saveJson(tokenPath, {
      access_token,
      item_id,
      institution_id: institutionId,
      created_at: new Date().toISOString(),
    });
    
    console.log('✓ Exchanged for access token');
    console.log(`✓ Saved to: ${tokenPath}`);
    
    printJson({ access_token, item_id, institution_id: institutionId });
    
  } catch (error) {
    handleError(error);
  }
}

main();
