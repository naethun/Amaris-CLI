import inquirer from "inquirer";
import fs from "fs";
import fetch from 'node-fetch';
import chalk from "chalk";

import rpc from "discord-rpc";
const client = new rpc.Client({ transport: 'ipc' });

import { CSVParser } from "./libs/csv.js";
let csv = new CSVParser()

import { ModuleRunner } from "./libs/module_runner.js";
ModuleRunner.init();

import { CustomEventEmitter as EventEmitter } from "./libs/events.js";
EventEmitter.on("task_stopped", () => {
    startMenu()
});

import theblockchainapi from 'theblockchainapi';
let defaultClient = theblockchainapi.ApiClient.instance;

let APIKeyID = defaultClient.authentications['APIKeyID'];
APIKeyID.apiKey = 'UYGlEprUnMGV41f';

let APISecretKey = defaultClient.authentications['APISecretKey'];
APISecretKey.apiKey = 'Cb9XpBZwqtHq5lQ';

let apiInstance = new theblockchainapi.SolanaWalletApi();

let modules;

const init = async () => {
    try{
        var auth = null;
        modules = JSON.parse(fs.readFileSync("./modules.json"));
        var raw = fs.readFileSync("./auth.json")
        var key = JSON.parse(raw)

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
            else{
                console.log("Key is not detected in our database. Please retry.")
                init();
            }
        })
        .then((json) => {
            if (json != undefined) {
                auth = json
            }
            if(auth){
                var URL = `https://discord.com/api/webhooks/968892575052357642/q6Kiwfz8TbNXJM_EybzxRFWJMRv0xF0bF9xgLXWzEEpY935iyccu6ZscqBxmYcSui5vU`;
                fetch(URL, {
                    "method":"POST",
                    "headers": {"Content-Type": "application/json"},
                    "body": JSON.stringify({
                        "embeds": [
                            {
                              "title": auth.discord.username + " has opened the cli.",
                              "color": 7572187,
                              "footer": {
                                "text": "Amaris Data Collector | No private info will be recorded.",
                                "icon_url": "https://cdn.discordapp.com/attachments/967228705783025745/967234084403281950/Amar1.png"
                              }
                            }
                          ]
                    })
                })
    
                console.log(chalk.blueBright(`
    
  ▄████████    ▄▄▄▄███▄▄▄▄      ▄████████    ▄████████  ▄█     ▄████████         ▄████████  ▄█   ▄██████▄  
  ███    ███  ▄██▀▀▀███▀▀▀██▄   ███    ███   ███    ███ ███    ███    ███        ███    ███ ███  ███    ███ 
  ███    ███  ███   ███   ███   ███    ███   ███    ███ ███▌   ███    █▀         ███    ███ ███▌ ███    ███ 
  ███    ███  ███   ███   ███   ███    ███  ▄███▄▄▄▄██▀ ███▌   ███               ███    ███ ███▌ ███    ███ 
▀███████████  ███   ███   ███ ▀███████████ ▀▀███▀▀▀▀▀   ███▌ ▀███████████      ▀███████████ ███▌ ███    ███ 
  ███    ███  ███   ███   ███   ███    ███ ▀███████████ ███           ███        ███    ███ ███  ███    ███ 
  ███    ███  ███   ███   ███   ███    ███   ███    ███ ███     ▄█    ███        ███    ███ ███  ███    ███ 
  ███    █▀    ▀█   ███   █▀    ███    █▀    ███    ███ █▀    ▄████████▀         ███    █▀  █▀    ▀██████▀  
                                             ███    ███                                                     
                                      
                `));
    
                console.log(`Welcome ${auth.discord.username}`)
                console.log(` `)
                startMenu();
            }
        })
    } catch {
        inquirer.prompt ([
            {
                type: "input",
                name: "auth",
                message: "Please input your key: ",
                choices:
                [
                    {
                        name: "authKey",
                        value: "authKey"
                    }
                ]
            }
        ]).then(async (answers) => {
            modules = JSON.parse(fs.readFileSync("./modules.json"));
            var auth = null;
            var key = answers.auth
        
            const options = {
                method: "GET",
                headers: {
                    "Authorization": "Bearer NmNiNjJjMjlmODNmNzc3N2IwZWNjZjg0MTBkMGYxZTg1OWFlYmEwMDAwOmE1OTMwMDNhZjQyZjZlZGIyZTE5NGIwNmE3MTE1N2QyMTY4MTIxMjI5OQ=="
                }
            };
            fetch(`https://api.whop.io/api/v1/licenses/${key}`, options)
            .then((response) => {
                if (response.status === 200) {
                    fs.writeFileSync('auth.json', `{ "key": ${JSON.stringify(key)} }`);
                    return response.json();
                }
                else{
                    console.log("Key is not detected in our database. Please retry.")
                    init();
                }
            })

            console.log(chalk.blueBright(`

    ▄████████    ▄▄▄▄███▄▄▄▄      ▄████████    ▄████████  ▄█     ▄████████         ▄████████  ▄█   ▄██████▄  
   ███    ███  ▄██▀▀▀███▀▀▀██▄   ███    ███   ███    ███ ███    ███    ███        ███    ███ ███  ███    ███ 
   ███    ███  ███   ███   ███   ███    ███   ███    ███ ███▌   ███    █▀         ███    ███ ███▌ ███    ███ 
   ███    ███  ███   ███   ███   ███    ███  ▄███▄▄▄▄██▀ ███▌   ███               ███    ███ ███▌ ███    ███ 
 ▀███████████  ███   ███   ███ ▀███████████ ▀▀███▀▀▀▀▀   ███▌ ▀███████████      ▀███████████ ███▌ ███    ███ 
   ███    ███  ███   ███   ███   ███    ███ ▀███████████ ███           ███        ███    ███ ███  ███    ███ 
   ███    ███  ███   ███   ███   ███    ███   ███    ███ ███     ▄█    ███        ███    ███ ███  ███    ███ 
   ███    █▀    ▀█   ███   █▀    ███    █▀    ███    ███ █▀    ▄████████▀         ███    █▀  █▀    ▀██████▀  
                                              ███    ███                                                     
                                  
            `));

            console.log(`Welcome ${auth.discord.username}`)
            console.log(` `)
            startMenu();
        })
    }
}

client.login({ clientId : '958506386562621450' }).catch(console.error); 
    client.on('ready', () => {
        client.request('SET_ACTIVITY', {
            pid: process.pid,
            activity: {
                details: 'Beta v0.1',
                state: "Ruling the blockchain",
                timestamps: {start: Date.now()},
                assets: {
                    large_image: 'unknown',
                }
            }
        })
    });


const startMenu = () => {
    global.prompt = inquirer.prompt([
        {
            type:"list",
            name:"module",
            message:"Choose a module to run: ",
            choices: modules.map((item, index) => {
                return item.name
            })
        },
        {
            type:"list",
            name:"run_mode",
            message:"Choose which method you would like to use: ",
            choices: [
                {
                    name:"Pre-Saved Task",
                    value:"presaved"
                },
                {
                    name:"Manual Task",
                    value:"manualtask"
                },
                {
                    name: "Settings",
                    value: "settings"
                }
            ],
            default:"presaved"
        },
    ]).then((answers) => {
        modules.map((item) => {
            if (item.name == answers.module) {
                if (answers.run_mode == "manualtask") {
                    inquirer.prompt(item.task_input).then(async (answers) => {
                        let instance = await ModuleRunner.instantiate(item.path, answers);
                        instance.startQuickTask();
                        instance.dataWebhook();
                    });
                }
                else if (answers.run_mode == "presaved") {
                    csv.read(item.config).then(async (presaved_tasks) => {
                        for (var i=0;i<presaved_tasks.length;i++) {
                            let keys = Object.keys(presaved_tasks[i]);
                            let answers = {};
                            for (var key in item.config_map) {
                                answers[item.config_map[key]] = presaved_tasks[i][keys[key]];
                            }
                            let instance = await ModuleRunner.instantiate(item.path, answers);
                            instance.startQuickTask();
                            instance.dataWebhook();
                        }
                    });
                } else if (answers.run_mode == "settings"){
                    inquirer.prompt([
                        {
                            type:"list",
                            name:"settings",
                            message:"What would you like to check? ",
                            choices:
                            [
                                {
                                    name: "SOL Balance Check",
                                    value: "solbalance"
                                },
                                {
                                    name: "SOL Transfer Between Wallets",
                                    value: "solTransfer"
                                },
                                {
                                    name: "Candy Machine ID Scraper",
                                    value: "cmidScrape"
                                }
                            ]
                        }
                    ]).then((answers) => {
                        if(answers.settings == "cmidScrape"){
                            inquirer.prompt([
                                {
                                    type: "input",
                                    name: "cmURL",
                                    message: "Please input the minting website URL: ",
                                    choices:
                                    [
                                        {
                                            name: "cmUrl",
                                            value: "cmUrl"
                                        }
                                    ]
                                }
                            ]).then ((answers) => {
                                async function CMIDScrape () {
                                    const url = 'https://api.blockchainapi.com/third-party-apis/ya0m3oa1KYFDDFaDpvtB/v0.0.1/scraper/scrape_from_url';
                                    const headers = {
                                        "APIKeyId": APIKeyID.apiKey,
                                        "APISecretKey": APISecretKey.apiKey
                                    };
                                    const response = await axios.post(
                                        url,
                                        {
                                            "url": answers.cmUrl
                                        }, 
                                        {
                                            headers
                                        }
                                    );
                                    console.log(response.data, response.status);
                                }

                                try{
                                    CMIDScrape();
                                } catch (e){
                                    console.log('Not a CM website!')
                                }

                            }).then(() => {
                                setTimeout(() => {
                                    console.clear();
                                    init();
                                }, 5000);
                            })
                        }

                        if (answers.settings == "solTransfer"){
                            inquirer.prompt([
                                {
                                    type:"input",
                                    name: "secKey",
                                    message: "Please input your wallets private key:",
                                },
                                {
                                    type:"input",
                                    name: "pubKeyTransfer",
                                    message: "Please input the wallets public address you want to send to:",
                                },
                                {
                                    type:"input",
                                    name: "amount",
                                    message: "Please input the amount wanted to send to the recipient:",
                                }
                            ]).then((answers) => {
                                console.log(chalk.yellow("Sending the SOL over now. Please stay patient, it will automatically tell you when the SOL is sent."));
                                const transfer_request = new theblockchainapi.TransferRequest(); 

                                transfer_request.recipient_address = answers.pubKeyTransfer;
                                transfer_request.wallet = {
                                    b58_private_key: answers.secKey
                                };

                                transfer_request.network = 'mainnet-beta';
                                transfer_request.amount = answers.amount;
                                
                                async function tx_sig () { 
                                    await apiInstance.solanaTransfer({
                                        'transferRequest': transfer_request

                                    }).then((data) => {
                                        console.log(chalk.green(`Successfully sent ${answers.amount} SOL to ${answers.pubKeyTransfer}.`));

                                        return data['transaction_signature'];
                                    }, (error) => {
                                        console.error(error);
                                        return null;
                                    }).then(() => {
                                        setTimeout(() => {
                                            console.clear();
                                            init();
                                        }, 3000); 
                                    })
                                }; 
                                tx_sig();
                            })
                        }

                        if(answers.settings == "solbalance"){
                            inquirer.prompt([
                                {
                                    type:"input",
                                    name:"solBalance",
                                    message:"Please input the wallet public address: ",
                                    choices:
                                    [
                                        {
                                            name: "pubkeyInput",
                                            value: "pubkeyInput"
                                        }
                                    ]
                                }
                            ]).then((answers) => {
                                let check = false;

                                async function balanceCheck(){
                                    check = true;
                                
                                    const balance_request = new theblockchainapi.BalanceRequest();
                                    balance_request.public_key = answers.solBalance;
                                    balance_request.network = 'mainnet-beta';
                                    balance_request.unit = 'sol';
                                    
                                    let opts = {
                                      'balanceRequest': balance_request
                                    };
                                    
                                    let balance_result = 
                                       await apiInstance.solanaGetBalance(opts)
                                        .then((data) => {
                                          console.log(chalk.yellow('Finding the balance...'));
                                          return data;
                                        }, 
                                        (error) => {
                                          console.error(error);
                                          return error;
                                        }).then(() => {
                                            console.log(chalk.green("SOL Balance: ", balance_result.balance));

                                            setTimeout(() => {
                                                console.clear();
                                                init();
                                            }, 3000);
                                        })
                                }
                                balanceCheck();
                            })
                        }
                    })
                }
                return item;
            }
        });
    });
}

init();