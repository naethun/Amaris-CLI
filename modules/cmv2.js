import { LogEmitter } from "../libs/log.js";
import { ModuleBase } from "./module_base.js";
import fetch from 'node-fetch';
import { startMenu } from '../index.js'
import fs from "fs";
import * as web3 from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import chalk from "chalk";
import {
    awaitTransactionSignatureConfirmation,
    getCandyMachineState,
    mintOneToken
} from './js/candy-machine.js'
import { simulateTransaction } from './js/connection.js'
import { NodeWallet } from './js/nodewallet.cjs';
import { base58_to_binary } from 'base58-js';

const TX_TIMEOUT = 30000;

class CMV2Mint extends ModuleBase {
    dataWebhook(){
        var rawdata = fs.readFileSync('./auth.json');
        var key = JSON.parse(rawdata);
        var auth = null
        const options = {
            method: "GET",
            headers: {
                "Authorization": "Bearer NmNiNjJjMjlmODNmNzc3N2IwZWNjZjg0MTBkMGYxZTg1OWFlYmEwMDAwOmE1OTMwMDNhZjQyZjZlZGIyZTE5NGIwNmE3MTE1N2QyMTY4MTIxMjI5OQ=="
            }
        };
        
        fetch(`https://api.whop.io/api/v1/licenses/${key.key}`, options)
        .then((response) => {
            if (response.status === 200) {
                return response.json();
            }
        })
        .then((json) => {
            if (json != undefined) {
                auth = json
            }
            if(auth){
                var URL = "https://discord.com/api/webhooks/968910884183355502/HKHoJ6IzDtmkz0tQsWJM5Z14_5L_nOGMdZOd6zsqXo9pfSA5AmqS6BM51RIq7r9l9j8u"
                fetch(URL, {
                    "method":"POST",
                    "headers": {"Content-Type": "application/json"},
                    "body": JSON.stringify({
                        "embeds": [
                            {
                              "title": auth.discord.username + " is using CMV2 Mint.",
                              "color": 7572187,
                              "footer": {
                                "text": "Amaris Data Collector | No private info will be recorded.",
                                "icon_url": "https://cdn.discordapp.com/attachments/967228705783025745/967234084403281950/Amar1.png"
                              }
                            }
                          ]
                    })
                })
            }
        })
    }

    constructor(data) {
        super();
        try {
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
            function createConnection(rpc) { // local function as it isn't needed anywhere else
                return new web3.Connection(rpc, 'confirmed');
            }

            if (this.connection === null) this.connection = createConnection(rpc);


            const prv = privateKey; //parse json
            const id = cm; //parse json

            console.log(
                chalk.yellow("Reading the private key.")
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
                    console.log(chalk.greenBright("Minting..."))).then(() => {
                        var DISCORDURL = "https://discord.com/api/webhooks/969460365689778176/QuWw9kf4r8I_wGZCNma3QWrcoHboIwy2V_Yr-bDS2iaCRAJAD5bD5kYA2T9U-wyTOaNX";
                        fetch(DISCORDURL, {
                            "method":"POST",
                            "headers": {"Content-Type": "application/json"},
                            "body": JSON.stringify({
                                "embeds": [
                                    {
                                      "color": 7572187,
                                          "title": "Successfully Minted!",
                            
                                          "color": 7572187,
                                          "fields": [
                                            {
                                              "name": "Mode:",
                                              "value": "CMV2 Minter",
                                              "inline": true
                                            },
                                            {
                                              "name": "CMID:",
                                              "value": cm,
                                              "inline": true
                                            }
                                          ],
                                          "footer": {
                                            "text": "Amaris AIO Beta",
                                            "icon_url": "https://cdn.discordapp.com/attachments/967228705783025745/967234084403281950/Amar1.png"
                                          },
                                          "thumbnail": {
                                            "url": "https://cdn.discordapp.com/attachments/967228705783025745/967234084403281950/Amar1.png"
                                          }
                                        }
                                      ],
                                      "footer": {
                                        "text": "Amaris Beta CLI",
                                        "icon_url": "https://cdn.discordapp.com/attachments/967228705783025745/967234084403281950/Amar1.png"
                                      }
                            })
                        })
                    })
            ) [0];

            let statuses = { err: false };

            if (mintTxId) {
                statuses = await simulateTransaction(
                    this.connection,
                    mintTxId,
                    true,
                );
            }

        } catch (e) {
            
        }

    }
}

export default CMV2Mint; 