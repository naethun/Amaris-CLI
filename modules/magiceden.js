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

export default class MagicEdenModule extends ModuleBase {
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
                    console.log(chalk.yellow("Monitoring for Collection: " + this.COLLECTION_NAME));

                    let displayLimit = 9
                    let priceLimit = this.WISH_PRICE * 1e9
                    let nft_info = [];

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
                        "https://api-mainnet.magiceden.io/rpc/getListedNFTsByQuery?q=%7B%22%24match%22%3A%7B%22collectionSymbol%22%3A%22" + this.COLLECTION_NAME + "%22%2C%22takerAmount%22%3A%7B%22%24lte%22%3A" + priceLimit + "%7D%7D%2C%22%24sort%22%3A%7B%22createdAt%22%3A-1%7D%2C%22%24skip%22%3A0%2C%22%24limit%22%3A" + displayLimit + "%7D",
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
            }
            else {
                console.log(chalk.red("Invalid data provided, please check your inputs."));
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
                    if (json) {
                        let TXData = json.tx.data;
                        this.getAndSendTX(TXData);
                    }
                }).catch((e) => {
                    console.log(chalk.red("Error buying NFT: " + e.message));
                });
            } catch(err){
                console.log(chalk.red("Error buying NFT: " + err.message));
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
                
                console.log(chalk.greenBright('Successfully bought NFT, TX: ' + finalTX));
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
                console.log(chalk.red(err.message))
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