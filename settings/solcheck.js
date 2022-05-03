import theblockchainapi from 'theblockchainapi';

let check = false;

let defaultClient = theblockchainapi.ApiClient.instance;

let APIKeyID = defaultClient.authentications['UYGlEprUnMGV41f'];
APIKeyID.apiKey = 'UYGlEprUnMGV41f';

let APISecretKey = defaultClient.authentications['Cb9XpBZwqtHq5lQ'];
APISecretKey.apiKey = 'Cb9XpBZwqtHq5lQ';

let apiInstance = new theblockchainapi.SolanaWalletApi();

export function balanceCheck(){
    check = true;

    const balance_request = new theblockchainapi.BalanceRequest(); // BalanceRequest | 
    balance_request.public_key = public_key;
    balance_request.network = 'devnet';
    balance_request.unit = 'sol';
    
    let opts = {
      'balanceRequest': balance_request
    };
    
    let balance_result = apiInstance.solanaGetBalance(opts).then((data) => {
      console.log('API called successfully.');
      return data;
    }, (error) => {
      console.error(error);
      return error;
    });
    
    console.log("SOL Balance Retrieved: ", balance_result);
    
}