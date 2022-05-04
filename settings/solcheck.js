import theblockchainapi from 'theblockchainapi';
import chalk from "chalk";
import { LogEmitter } from "../libs/log.js";
import { pubKeys } from "../index.js"

let check = false;

let defaultClient = theblockchainapi.ApiClient.instance;

let APIKeyID = defaultClient.authentications['APIKeyID'];
APIKeyID.apiKey = 'UYGlEprUnMGV41f';

let APISecretKey = defaultClient.authentications['APISecretKey'];
APISecretKey.apiKey = 'Cb9XpBZwqtHq5lQ';

let apiInstance = new theblockchainapi.SolanaWalletApi();

async function balanceCheck(){
    check = true;

    const balance_request = new theblockchainapi.BalanceRequest(); // BalanceRequest | 
    balance_request.public_key = pubKeys;
    balance_request.network = 'mainnet-beta';
    balance_request.unit = 'sol';
    
    let opts = {
      'balanceRequest': balance_request
    };
    
    let balance_result = 
      await apiInstance.solanaGetBalance(opts)
        .then((data) => {
          //chalk.yellow(console.log('Finding the balance...'));
          return data;
        }, 
        (error) => {
          console.error(error);
          return error;
        });
    
      
    chalk.green(console.log("SOL Balance: ", balance_result.balance));
}