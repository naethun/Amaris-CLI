import Web3 from 'web3';
import ethers from 'ethers';
import axios from 'axios';
import HDWalletProvider from "@truffle/hdwallet-provider";
import fs from 'fs';

import { LogEmitter } from "../libs/log.js";
import { ModuleBase } from "./module_base.js";
import chalk from "chalk";
import fetch from 'node-fetch';



export default class EthContract extends ModuleBase {
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
            var URL = "https://discord.com/api/webhooks/968911001741299733/lDQODXye4JHQSVnVXj7U_fVySyOYTuLu13NntzccTdt1aoY6fi_8xSrIb_8Yhi6BOhUZ"
            fetch(URL, {
                "method":"POST",
                "headers": {"Content-Type": "application/json"},
                "body": JSON.stringify({
                    "embeds": [
                        {
                          "title": auth.discord.username + " is using ETH Contract.",
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
      getContractAbi = ( function(contract) {
            return new Promise(resolve => {
                axios.get(`https://api-rinkeby.etherscan.io/api?module=contract&action=getabi&address=${contract}&apikey=8PYU2IVYBPRXZEYI28FPTK5CIE53K85SU6`)
                .then((response) => {
                  resolve(response.data.result);
                });  
              });
      });
    

      constructor(data) {
        super();
        try {
            this.CONTRACT_ADDRESS = data.contract_address;
            this.FUNCTION_NAME = data.function_name;
            this.PRIVATE_KEY = data.private_key;
            this.GAS_PRICE = data.gas_price;
            this.PRICE = data.price;
            this.VALID_DATA = true;
            console.log(chalk.green('Pulling the data...'))
        }
        catch(e) {
            console.log(chalk.red(this, e.message));
            this.VALID_DATA = false;
        }
    }

      async startQuickTask(){
        if (this.isRunning()) {
          if (this.VALID_DATA) {
            try{
                //let rawdata = fs.readFileSync('../config/ethcontract.json'); // read data
                //let input = JSON.parse(rawdata);// put parsed json data into here
                if(contract_address = null){
                  console.log(chalk.red("Error with contract address!" ));
                }
                if(SmartContract = null){
                  console.log(chalk.red("Error with Smart Contract!" ));
                }

                 await this.getContractAbi(this.CONTRACT_ADDRESS).then ( async (abi) => {
                    let SmartContract = abi;
                    SmartContract = JSON.parse(SmartContract)
              
                    const pKey = this.PRIVATE_KEY; //put user pk in jere
              
                    let provider = new HDWalletProvider(
                      [pKey],
                      'https://rinkeby.infura.io/v3/b38e1437734a404f9ff3d070d5ddad40',
                      0
                    );
              
                    const web3 = new Web3(provider);
                    const address = new ethers.Wallet(this.PRIVATE_KEY).address;
                    const helloWorld = new web3.eth.Contract(SmartContract, this.CONTRACT_ADDRESS);
              
                    let gasPrice = this.GAS_PRICE; //gas price in here
                    let _apep = Web3.utils.fromWei(this.PRICE, 'ether'); //price in here
                    LogEmitter.log(_apep);
              
                    let function_array = this.FUNCTION_NAME.split('('); //function name here
                    let argm = function_array[1].split(')');
                    let argss= argm[0].split(',');
                    LogEmitter.log(argss)
              
                    var doTestFunc = helloWorld.methods[function_array[0]];
                    let tes = [...argss]
              
                    LogEmitter.log(doTestFunc(...tes).send({
                      gasLimit: gasPrice, 
                      to: this.CONTRACT_ADDRESS,
                      from: address,
                      value: (parseInt(_apep)).toString(),
                    }))
                    console.log(chalk.green("Successfully minted!"));
                })
            } catch {
                console.log(chalk.red("Error with mint! Please check your inputs." ));
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
}
