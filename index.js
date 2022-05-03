import inquirer from "inquirer";
import fs from "fs";
import fetch from 'node-fetch';
import rpc from "discord-rpc";
const client = new rpc.Client({ transport: 'ipc' });

import { CSVParser } from "./libs/csv.js";
import { balanceCheck } from './settings/solcheck.js'
import { ModuleRunner } from "./libs/module_runner.js";
ModuleRunner.init();

import { CustomEventEmitter as EventEmitter } from "./libs/events.js";
EventEmitter.on("task_stopped", () => {startMenu()});

import chalk from "chalk";

let csv = new CSVParser()/*.then((data) => {
    console.log("asdasdas");
}).catch((e) => {
    console.log("21321321");
});*/
let modules;

/*process.on('SIGINT', () => {
    ModuleRunner.destroyAll();
});*/

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

const init = async () => {
    modules = JSON.parse(fs.readFileSync("./modules.json"));
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
        else{
            console.log("Key is not detected in our database. Please retry.")
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

            console.log(`Welcome ${auth.discord.username}`)
            console.log(` `)
            startMenu();
        }
    })
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
                                }
                            ]
                        }
                    ]).then((answers) => {
                        if(answers.settings == "solbalance"){
                            let check = false;
                            const clearLastLine = () => {
                                process.stdout.moveCursor(0, -4)
                                process.stdout.clearLine(1)
                              }

                            balanceCheck();
                            
                            if (check = true ){
                                setTimeout(() => {
                                    clearLastLine();
                                    startMenu();
                                }, 1000);
                            }
                        }
                    })
                }
                return item;
            }
        });
    });
}

init();