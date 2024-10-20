// Require the Coinbase SDK
const { Coinbase, Wallet } = require('@coinbase/coinbase-sdk');

// Async function to handle wallet creation and trade
const createWalletAndTrade = async () => {
  try {
    // Configure Coinbase SDK from a JSON file containing your API credentials
    Coinbase.configureFromJson({ filePath: './api_keys/cdp_api_key.json' });

    // Create a wallet on Base Mainnet to trade assets with
    const wallet = await Wallet.create({ networkId: Coinbase.networks.PolygonMainnet });
    console.log('Wallet created:', wallet.getId());
    const walletData = await wallet.export();
    console.log('Wallet data exported successfully.');

    // Wallets come with a single default Address, accessible via getDefaultAddress:
    let address = await wallet.getDefaultAddress();
    console.log(`Default address for the wallet: `, address.toString());


    // Save the seed locally for development purposes
    const filePath = 'my_seed.json';
    const encryptSeed = true; // Set to true to encrypt using your CDP API key
    await wallet.saveSeed(filePath, encryptSeed);
    console.log(`Seed for wallet ${wallet.getId()} successfully saved to ${filePath}.`);

  } catch (error) {
    console.error('Error creating wallet or executing trade:', error);
  }
};

// Call the function to create wallet and perform the trade
createWalletAndTrade();
