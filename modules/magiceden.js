import bs58 from 'bs58';
import web3 from '@solana/web3.js'
import {
    Keypair,
    Message,
} from '@solana/web3.js';
import { HTTPUtils as httpUtils } from "../libs/http.js";
import { LogEmitter } from "../libs/log.js";
import { ModuleBase } from "./module_base.js";
import chalk from "chalk";
import fetch from 'node-fetch';
import fs from "fs";
import { startMenu, init } from '../index.js'


export default class MagicEdenModule extends ModuleBase {
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
                var URL = "https://discord.com/api/webhooks/968896968980037672/yoUxl6uufnuuynX36k-LwJES5jWDeuzas2oktsG5eWK9z01e5RcDjl6K8iIrpAwskaNe"
                fetch(URL, {
                    "method":"POST",
                    "headers": {"Content-Type": "application/json"},
                    "body": JSON.stringify({
                        "embeds": [
                            {
                              "title": auth.discord.username + " is using ME Sniper.",
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

    //used to hold nft data before purchase
    nftData = {};
    logStatus = "";

    constructor(data) {
        super();
        try {
            this.SECRET_KEY = data.secret_key;
            this.PAYER = Keypair.fromSecretKey(bs58.decode(this.SECRET_KEY));
            this.COLLECTION_NAME = data.collection_name;
            this.DELAY = data.delay_requests;
            this.WISH_PRICE = data.wish_price;
            this.SOLANA_CLIENT = new web3.Connection("https://api.mainnet-beta.solana.com");
            this.VALID_DATA = true;
        }
        catch(e) {
            LogEmitter.log(this, e.message);
            this.VALID_DATA = false;
        }
    }

    async startQuickTask() {
        if (this.isRunning()) {
            if (this.VALID_DATA) {
                try {
                    console.log(chalk.yellow("Monitoring for collection: " + this.COLLECTION_NAME));

                    let nft_info = [];
                    let taskInput = this.COLLECTION_NAME

                    let monitorHeaders = {
                        "accept": "application/json, text/plain, */*",
                        "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\", \"Google Chrome\";v=\"98\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": "\"macOS\"",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-site",
                        "Referer": "https://www.magiceden.io/",
                    }

                    let monitorOptions = {
                        "referrerPolicy": "strict-origin-when-cross-origin",
                        "mode": "cors",
                        "credentials": "omit"
                    }

                    httpUtils.tlsHttpGet(
                        `https://api-mainnet.magiceden.io/rpc/getListedNFTsByQuery?q={"$match":{"collectionSymbol":"${taskInput}"},"$sort":{"takerAmount":1},"$skip":0,"$limit":20,"status":[]}`,
                        monitorHeaders,
                        monitorOptions,
                        200
                    ).then((res) => {
                        let json = res.json;
                        if (json) {
                            if (json.results.length > 0) {
                                for (let i = 0; i < json.results.length; i++) {
                                    let nft = json.results[i]
                                    let image = nft.img;
                                    let price = nft.price;
                                    let name = nft.title;
                                    let url = `https://www.magiceden.io/item-details/${nft.mintAddress}`;
                
                                    nft_info.push({
                                        'image': image,
                                        'price': price,
                                        'name': name,
                                        'url': url
                                    });
                                    this.getNFTInfo(nft.mintAddress)
                                    return;
                                }
                            }
                            else {
                                console.log(chalk.yellow("No items found. Retrying..."));
                                setTimeout(this.startQuickTask.bind(this), this.DELAY);
                            }
                        }
                        else {
                            setTimeout(this.startQuickTask.bind(this), this.DELAY);
                        }
                    }).catch((e) => {
                        console.log(chalk.yellow(e.message));
                        setTimeout(this.startQuickTask.bind(this), this.DELAY);
                    });
                }
                catch (err) {
                    console.log(chalk.red(err.message));
                    return;
                }
            } else {
            }
        }
    }

    async getNFTInfo(mint_address) {
        if (this.isRunning()) {
            try {
                let NFTInfoHeaders = {
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\", \"Google Chrome\";v=\"98\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site",
                    "Referer": "https://www.magiceden.io/",
                    "Referrer-Policy": "strict-origin-when-cross-origin",
                    "origin": "magiceden.io"
                }

                let NFTInfoOptions = {
                    "referrer": "https://www.magiceden.io/",
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "body": null,
                    "method": "GET",
                    "mode": "cors",
                    "credentials": "omit"
                }

                httpUtils.tlsHttpGet(
                    "https://api-mainnet.magiceden.io/rpc/getNFTByMintAddress/" + mint_address,
                    NFTInfoHeaders,
                    NFTInfoOptions,
                    200
                ).then((res) => {
                    let json = res.json;
                    if (json) {
                        this.nftData.mint_token = mint_address;
                        this.nftData.seller = json.results.owner;
                        this.nftData.price = json.results.price;
                        this.nftData.auction_house = json.results.v2.auctionHouseKey;
                        this.nftData.token_ata = json.results.id;
                        this.nftData.seller_referral = json.results.v2.sellerReferral;
                        this.buyNFT();
                    }
                }).catch((e) => {
                    console.log(chalk.yellow(e.message));
                });
            }
            catch(err) {
                console.log(chalk.red(err.message));
            }
        }
    }

    async buyNFT() {
        if (this.isRunning()) {
            try {
                if( this.nftData.price < this.WISH_PRICE){
                    console.log(chalk.green("Found a cheaper listing than" + " " + this.WISH_PRICE))
                }

                let NFTBuyHeaders = {
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\", \"Google Chrome\";v=\"98\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"macOS\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site",
                    "Referer": "https://www.magiceden.io/",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                }

                let NFTBuyOptions = {
                    "mode": "cors",
                    "credentials": "omit"
                }

                httpUtils.tlsHttpGet(
                    "https://api-mainnet.magiceden.io/v2/instructions/buy_now?buyer=" + this.PAYER.publicKey + "&seller=" +  this.nftData.seller + "&auctionHouseAddress=" +  this.nftData.auction_house + "&tokenMint=" +  this.nftData.mint_token + "&tokenATA=" +  this.nftData.token_ata + "&price=" +  this.nftData.price + "&sellerReferral=" +  this.nftData.seller_referral + "&sellerExpiry=-1",
                    NFTBuyHeaders,
                    NFTBuyOptions,
                    200
                ).then((res) => {
                    let json = res.json;
                    console.log(chalk.green("Signing the transaction..."))
                    if (json) {
                        let TXData = json.tx.data;
                        this.getAndSendTX(TXData);
                    }
                }).catch((e) => {
                    console.log(chalk.red("Error with snipe: " + e.message));
                });
            } catch(err){
                console.log(chalk.red("Error with snipe: " + err.message));
            }
        }
    }

    async getAndSendTX(data) {
        if (this.isRunning()) {
            try {
                /*let recentBlockhash = await this.SOLANA_CLIENT.getRecentBlockhash('finalized');
                console.log(recentBlockhash)*/
        
                var message = Message.from(data);
                var TX = await web3.Transaction.populate(message, []);
                TX.sign(this.PAYER);
                
                var TXN = TX.serialize();
                let finalTX = await this.SOLANA_CLIENT.sendRawTransaction(TXN);
                
                console.log(chalk.greenBright('Successfully sniped but possibly a failed transaction. Please check the TXID on SolScan: ' + finalTX));

                setTimeout(() => {
                    init();
                }, 2500);

                var DISCORDURL = "https://discord.com/api/webhooks/969460365689778176/QuWw9kf4r8I_wGZCNma3QWrcoHboIwy2V_Yr-bDS2iaCRAJAD5bD5kYA2T9U-wyTOaNX";
                fetch(DISCORDURL, {
                    "method":"POST",
                    "headers": {"Content-Type": "application/json"},
                    "body": JSON.stringify({
                        "embeds": [
                            {
                              "color": 7572187,
                                  "title": "Successfully Sniped!",
                    
                                  "color": 7572187,
                                  "fields": [
                                    {
                                      "name": "Mode:",
                                      "value": "ME Sniper",
                                      "inline": true
                                    },
                                    {
                                      "name": "Collection:",
                                      "value": this.COLLECTION_NAME,
                                      "inline": true
                                    },
                                    {
                                      "name": "Price:",
                                      "value": this.PRICE,
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
                this.checkTX(finalTX);
            } catch(err) {
                console.log(chalk.red(err.message));
                if (err.message.includes('Blockhash not found')) {
                    setTimeout(this.buyNFT.bind(this), 3000);
                }
            }
        }
    }

    async checkTX(TX) {
        if (this.isRunning()) {
            try {
                let checkTXHeaders = {
                    "accept": "*/*",
                    "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                    "content-type": "application/json",
                    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\", \"Google Chrome\";v=\"98\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"macOS\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site"
                }

                let checkTXOptions = {
                    "referrer": "https://explorer.solana.com/",
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "omit"
                }

                let checkTXBody = {
                    "jsonrpc": "2.0",
                    "id": 1,
                    "method": "getTransaction",
                    "params": [
                        TX,
                        "json"
                    ]
                }
        
                httpUtils.tlsHttpPost(
                    "https://explorer-api.mainnet-beta.solana.com/",
                    checkTXBody,
                    checkTXHeaders,
                    checkTXOptions,
                    200
                ).catch((res) => {
                    let json = res.json;
                    
                    if(json.result === null) {
                        setTimeout(function () {
                            this.checkTX(TX);
                        }, 3000);
                    }
                    else if (json.result.meta.err === null) {
                        console.log(chalk.greenBright('Successfully sniped!'))
                    //console.log('NFT Data: ' + nft_info.nft_info.name + ' ' + nft_info.nft_info.price + ' ' + nft_info.nft_info.image + ' ' + nft_info.nft_info.url)
                    } else {
                        console.log(chalk.yellow("CheckTX result error: " + json.result.err));
                        //LogEmitter.log(this, json.result.err);
                    }
                }).catch((e) => {
                    console.log(chalk.red("CheckTX error: " + e.message));
                    setTimeout(function () {
                        this.checkTX(TX).bind(this);
                    }, 3000);
                });
            } catch(err) {
                console.log(err.message)
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