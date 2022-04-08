"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])));
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};

import { LogEmitter } from "../libs/log.js";
import { ModuleBase } from "./module_base.js";

import bs58 from 'bs58';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import anchor from '@project-serum/anchor';
import { getCandyMachineState , mintOneToken, awaitTransactionSignatureConfirmation} from './depend/candy-machine.js';

var txTimeoutInMilliseconds = 30000;
var connection = new Connection("https://api.mainnet-beta.solana.com", 'confirmed');

export default class CMV2Mint extends ModuleBase {
    constructor(data) {
        super();
        try {
            this.RPC = data.rpc;
            this.PRIVATE_KEY = data.private_key;
            this.CMID = data.cmid;
            this.VALID_DATA = true;
        }
        catch(e) {
            LogEmitter.log(this, e.message);
            this.VALID_DATA = false;
        }
    }

    async startQuickTask(){
        if(this.isRunning){
            if(this.VALID_DATA){
                try{
                    LogEmitter.log(this, "Starting task...")

                    __awaiter(this, void 0, void 0, function () {
                        var prv, id, bin, candyMachineId, NodeWallet, wallet, balanace, cndy, mintTxId, statuses, e_1;
            
                        __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 6, , 7]);
                                    prv = this.PRIVATE_KEY;
                                    id = this.CMID;
                                    LogEmitter.log(this, "Public Key: " + wallet.publicKey)
            
                                    wallet = ModuleBase.local;
                                    bin = Keypair.fromSecretKey(bs58.decode(prv));;
            
                                    candyMachineId = new anchor.web3.PublicKey(id);
            
                                    return [4 /*yield*/, connection.getBalance(wallet.publicKey)];
                                case 1:
                                    balanace = _a.sent();
                                    LogEmitter.log(this, "case 1");
                                    return [4 /*yield*/, (0, getCandyMachineState)(wallet, candyMachineId, connection)];
                                case 2:
                                    cndy = _a.sent();
                                    return [4 /*yield*/, (0, mintOneToken)(cndy, wallet.publicKey)];
                                case 3:
                                    mintTxId = (_a.sent())[0];
                                    LogEmitter.log(this, "Successfully Minted with: " + mintTxId);
                                    statuses = { err: true };
                                    if (!mintTxId) return [3 /*break*/, 5];
                                    return [4 /*yield*/, (0, awaitTransactionSignatureConfirmation)(mintTxId, txTimeoutInMilliseconds, connection, true)];
                                case 4:
                                    statuses = _a.sent();
                                    LogEmitter.log(this, "Status is : " + statuses);
                                    _a.label = 5;
                                case 5: return [3 /*break*/, 7];
                                case 6:
                                    e_1 = _a.sent();
                                    return [3 /*break*/, 7];
                                case 7: return [2 /*return*/];
                            }
                        });
                    });
                } catch {
                    LogEmitter.log(this, "Error");
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