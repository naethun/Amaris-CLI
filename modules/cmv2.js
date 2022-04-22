import { LogEmitter } from "../libs/log.js";
import { ModuleBase } from "./module_base.js";

import * as web3 from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import chalk from "chalk";

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
                    LogEmitter.log(this, chalk.yellow("Task loaded."))
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
            var loop = 0

            function createConnection(rpc) { // local function as it isn't needed anywhere else
                return new web3.Connection(rpc, 'confirmed');
            }

            if (this.connection === null) this.connection = createConnection(rpc);


            const prv = privateKey; //parse json
            const id = cm; //parse json

            console.log(
                chalk.yellow(" Reading the private key.")
            )

            const bin = base58_to_binary(prv)

            const candyMachineId = new anchor.web3.PublicKey(
                id,
            );

            const wallet = NodeWallet.local(bin);
            console.log(
                chalk.yellow("Found public key.")
            )

            let balanace = await this.connection.getBalance(wallet.publicKey);

            console.log(chalk.yellow("Using Candy Machine ID. " , id));

            const cndy = await getCandyMachineState(
                wallet,
                candyMachineId,
                this.connection,
                console.log(chalk.greenBright("Initalizing transaction for mint!"))
            );

            const mintTxId = (
                await mintOneToken(
                    cndy, 
                    wallet.publicKey, 
                    console.log(chalk.greenBright("Minting...")))
            ) [0];

            if(mintTxId = undefined){
                console.log(chalk.bgRed("Minting failed. Please restart your task"))
            } else {
                console.log(chalk.bgGreen(`Successfully minted! Transaction id: `, mintTxId));
            }

            let statuses = { err: false };

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
            console.log(chalk.redBright("Error connecting, please restart your task."));
        }

    }
}

export default CMV2Mint;