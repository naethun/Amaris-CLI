import inquirer from "inquirer";
import fs from "fs";
import fetch from 'node-fetch';
import setTitle from "node-bash-title";
setTitle('Amaris CLI');

import { CSVParser } from "./libs/csv.js";

import { ModuleRunner } from "./libs/module_runner.js";
ModuleRunner.init();

import { CustomEventEmitter as EventEmitter } from "./libs/events.js";
EventEmitter.on("task_stopped", () => {startMenu()});

import figlet from "figlet";
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

console.log(
    chalk.bold.magenta(
        figlet.textSync('Amaris CLI', { horizontalLayout: 'full' })
    )
);
const init = async () => {
    modules = JSON.parse(fs.readFileSync("./modules.json"));
    var rawdata = fs.readFileSync('./auth.json');
    var key = JSON.parse(rawdata);

    var auth = null
    
    const options = {
        method: "GET",
        headers: {
            "Authorization": "Bearer MTE2OWEzMzE4MWQ1Mzc1NTg3MzVhZDM3YWU0MjdjZTZjYTU3ZTdhMmU4OmI3Y2UzNGE2NTc4MGYzNjZhMDA0NDIzMjhmYjA5N2FjMmRjNjY4YjE2ZQ=="
        }
    };
    fetch(`https://api.whop.io/api/v1/licenses/${key.key}`, options)
    .then((response) => {
        if (response.status === 200) {
            return response.json();
        }
        else{
            console.log("Key is not detected.")
        }
    })
    .then((json) => {
        if (json != undefined) {
            auth = json
        }
        if(auth){
            console.log(`Welcome ${auth.discord.username}`)
            console.log(` `)
            startMenu();
        }
    })
}

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
            message:"Choose a running method: ",
            choices: [
                {
                    name:"Pre-Saved Input",
                    value:"presaved"
                },
                {
                    name:"Manual Input",
                    value:"manualtask"
                }
            ],
            default:"manualtask"
        },
    ]).then((answers) => {
        modules.map((item) => {
            if (item.name == answers.module) {
                if (answers.run_mode == "manualtask") {
                    inquirer.prompt(item.task_input).then(async (answers) => {
                        let instance = await ModuleRunner.instantiate(item.path, answers);
                        instance.startQuickTask();
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
                        }
                    });
                }
                return item;
            }
        });
    });
}

init();