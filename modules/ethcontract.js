import Web3 from 'web3';
import ethers from 'ethers';
import axios from 'axios';
import HDWalletProvider from "@truffle/hdwallet-provider";
import fs from 'fs';

import { LogEmitter } from "../libs/log.js";
import { ModuleBase } from "./module_base.js";

export default class EthContract extends ModuleBase {
      getContractAbi = (async function(contract) {
          if(this.isRunning){
            return new Promise(resolve => {
                axios.get(`https://api-rinkeby.etherscan.io/api?module=contract&action=getabi&address=${contract}&apikey=8PYU2IVYBPRXZEYI28FPTK5CIE53K85SU6`)
                .then((response) => {
                  resolve(response.data.result);
                });  
              });
          }
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
        }
        catch(e) {
            LogEmitter.log(this, e.message);
            this.VALID_DATA = false;
        }
    }

      async startQuickTask(){
        if (this.isRunning()) {
          if (this.VALID_DATA) {
            try{
                //let rawdata = fs.readFileSync('../config/ethcontract.json'); // read data
                //let input = JSON.parse(rawdata);// put parsed json data into here
              
                const contract_address = this.CONTRACT_ADDRESS; //address of the contract goes here

                if(contract_address = null){
                  LogEmitter.log( this, "Error with contract address!" );
                }
                if(SmartContract = null){
                  LogEmitter.log( this, "Error with Smart Contract!" );
                }

                 (abi) => {
                    let SmartContract = abi;
                    SmartContract = JSON.parse(SmartContract)
              
                    const pKey = this.PRIVATE_KEY; //put user pk in jere
              
                    let provider = new HDWalletProvider(
                      [pKey],
                      'https://rinkeby.infura.io/v3/b38e1437734a404f9ff3d070d5ddad40',
                      0
                    );
              
                    const web3 = new Web3(provider);
                    const address = new ethers.Wallet(pKey).address;
                    const helloWorld = new web3.eth.Contract(SmartContract, contract_address);
              
                    let gasPrice = this.GAS_PRICE; //gas price in here
                    let _apep = Web3.utils.fromWei(this.PRICE, 'ether'); //price in here
                    LogEmitter.log(_apep);
              
                    let function_array = this.FUNCTION_NAME.split('('); //function name here
                    let argm = function_array[1].split(')');
                    let argss= argm[0].split(',');
                    LogEmitter.log(argss)
              
                    var doTestFunc = helloWorld.methods[function_array[0]];
                    let tes = [...argss]
              
                    console.log(doTestFunc(...tes).send({
                      gasLimit: gasPrice, 
                      to: contract_address,
                      from: address,
                      value: (parseInt(_apep)).toString(),
                    }))
                    LogEmitter.log( this, "Successfully minted!" );
                }
            } catch {
                LogEmitter.log(this, "Error with mint! Please check your inputs." );
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
