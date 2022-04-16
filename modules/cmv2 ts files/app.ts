import * as web3 from '@solana/web3.js';
import * as anchor from "@project-serum/anchor";
import {
  awaitTransactionSignatureConfirmation,
  getCandyMachineState,
  mintOneToken,
} from './candy-machine';

const { base58_to_binary } = require('base58-js')

const info = require('./c-reader')

const rpc = info.rpc //parse json

const txTimeoutInMilliseconds = 30000;

const connection = new web3.Connection(rpc, 'confirmed');
  

async function cop(){
    try{

      const prv = info.pKey; //parse json
      const id = info.cm; //parse json

        console.log("Converted Array")
        const bin = base58_to_binary(prv)

        console.log(bin);


        const candyMachineId = new anchor.web3.PublicKey(
          id,
        );

            const NodeWallet = require("./nodewallet.js").default;
          
            const wallet = NodeWallet.local(bin);
            console.log(`Public Key: `,wallet.publicKey)

            let balanace = await connection.getBalance(wallet.publicKey);

            console.log(balanace);
            const cndy = await getCandyMachineState(
              wallet,
              candyMachineId,
              connection,
            );

              const mintTxId = (
                await mintOneToken(cndy,  wallet.publicKey)
              )[0];

              console.log(`Successfully Minted with: `,mintTxId);
              let statuses: any = { err: true };

              if (mintTxId) {
                statuses = await awaitTransactionSignatureConfirmation(
                  mintTxId,
                  txTimeoutInMilliseconds,
                  connection,
                  true,
                );

                console.log(`Status is : `, statuses);
              }

    }catch(e){
        console.log(e);
    }
    
}

cop()


