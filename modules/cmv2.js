import { LogEmitter } from "../libs/log.js";
import { ModuleBase } from "./module_base.js";

import * as web3 from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';

import {
    awaitTransactionSignatureConfirmation,
    getCandyMachineState,
    mintOneToken
} from './js/candy-machine.js'

import { NodeWallet } from './js/nodewallet.cjs';
import { base58_to_binary } from 'base58-js';

const TX_TIMEOUT = 30000;

class CMV2Mint extends ModuleBase {

    constructor(data) {
        super();
        try {
            // this was just for testing purposes
            // this.RPC = "https://api.mainnet-beta.solana.com"
            // this.CMID = "9C1NzA9hrsaB5QENamBUpnCnbHRp3fhK3dmKdEJojX4m"
            // this.PRIVATE_KEY = "2SVJR5eHaMFMfNCRHaZP78vd54LVPbqQvEP2KcGAZk3hTJSD9cA5mKw3gvAU7rxRYAPxkECdgZrJkHvShVYH4ku8";
            this.connection = null;
            this.CMID = data.cmid;
            this.RPC = data.rpc;
            this.PRIVATE_KEY = data.private_key;
            this.VALID_DATA = true;
        }
        catch (e) {
            LogEmitter.log(this, e.message);
            this.VALID_DATA = false;
        }
    }

    async startQuickTask() {
        if (this.isRunning()) {
            if (this.VALID_DATA) {
                try {
                    LogEmitter.log(this, "Task loaded.")
                    this.cop(this.PRIVATE_KEY, this.CMID, this.RPC);
                } catch {
                    LogEmitter.log(this, "Error, couldnt load task.")
                }
            }
        }
    }

    isRunning() {
        if (this.RUNNING) {
            return true;
        }
        else {
            this.reportDestroyed();
        }
    }





    async cop(privateKey, cm, rpc) {
        try {
            function createConnection(rpc) { // local function as it isn't needed anywhere else
                return new web3.Connection(rpc, 'confirmed');
            }

            if (this.connection === null) this.connection = createConnection(rpc);


            const prv = privateKey; //parse json
            const id = cm; //parse json

            console.log("Converted Array")
            const bin = base58_to_binary(prv)

            console.log(bin);


            const candyMachineId = new anchor.web3.PublicKey(
                id,
            );

            const wallet = NodeWallet.local(bin);
            console.log(`Public Key: `, wallet.publicKey)

            let balanace = await this.connection.getBalance(wallet.publicKey);

            console.log(balanace);
            const cndy = await getCandyMachineState(
                wallet,
                candyMachineId,
                this.connection,
            );

            const mintTxId = (
                await mintOneToken(cndy, wallet.publicKey)
            )[0];

            console.log(`Successfully Minted with: `, mintTxId);
            let statuses = { err: true };

            if (mintTxId) {
                statuses = await awaitTransactionSignatureConfirmation(
                    mintTxId,
                    TX_TIMEOUT,
                    this.connection,
                    true,
                );

                console.log(`Status is : `, statuses);
            }

        } catch (e) {
            console.log(e);
        }

    }
}

export default CMV2Mint;