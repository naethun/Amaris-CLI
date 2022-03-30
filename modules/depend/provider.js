"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
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
exports.getProvider = exports.setProvider = void 0;
import { sendAndConfirmRawTransaction , Connection } from '@solana/web3.js';
/**
 * The network and wallet context used to send transactions paid for and signed
 * by the provider.
 */
 export var Provider = /** @class */ (function () {
    /**
     * @param connection The cluster connection where the program is deployed.
     * @param wallet     The wallet used to pay for and sign all transactions.
     * @param opts       Transaction confirmation options to use by default.
     */
    function Provider(connection, wallet, opts) {
        this.connection = connection;
        this.wallet = wallet;
        this.opts = opts;
    }
    Provider.defaultOptions = function () {
        return {
            preflightCommitment: "recent",
            commitment: "recent"
        };
    };
    /**
     * Returns a `Provider` with a wallet read from the local filesystem.
     *
     * @param url  The network cluster url.
     * @param opts The default transaction confirmation options.
     *
     * (This api is for Node only.)
     */
    Provider.local = function (url, secret, opts) {
        opts = opts !== null && opts !== void 0 ? opts : Provider.defaultOptions();
        var connection = new Connection(url !== null && url !== void 0 ? url : "http://localhost:8899", opts.preflightCommitment);
        var NodeWallet = require("./nodewallet.js")["default"];
        var wallet = NodeWallet.local(secret);
        return new Provider(connection, wallet, opts);
    };
    /**
     * Returns a `Provider` read from the `ANCHOR_PROVIDER_URL` environment
     * variable
     *
     * (This api is for Node only.)
     */
    Provider.env = function () {
        var process = require("process");
        var url = process.env.ANCHOR_PROVIDER_URL;
        if (url === undefined) {
            throw new Error("ANCHOR_PROVIDER_URL is not defined");
        }
        var options = Provider.defaultOptions();
        var connection = new Connection(url, options.commitment);
        var NodeWallet = require("./nodewallet.js")["default"];
        var wallet = NodeWallet.local();
        return new Provider(connection, wallet, options);
    };
    /**
     * Sends the given transaction, paid for and signed by the provider's wallet.
     *
     * @param tx      The transaction to send.
     * @param signers The set of signers in addition to the provider wallet that
     *                will sign the transaction.
     * @param opts    Transaction confirmation options.
     */
    Provider.prototype.send = function (tx, signers, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, rawTx, txId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (signers === undefined) {
                            signers = [];
                        }
                        if (opts === undefined) {
                            opts = this.opts;
                        }
                        tx.feePayer = this.wallet.publicKey;
                        _a = tx;
                        return [4 /*yield*/, this.connection.getRecentBlockhash(opts.preflightCommitment)];
                    case 1:
                        _a.recentBlockhash = (_b.sent()).blockhash;
                        return [4 /*yield*/, this.wallet.signTransaction(tx)];
                    case 2:
                        _b.sent();
                        signers
                            .filter(function (s) { return s !== undefined; })
                            .forEach(function (kp) {
                            tx.partialSign(kp);
                        });
                        rawTx = tx.serialize();
                        return [4 /*yield*/, (0, sendAndConfirmRawTransaction)(this.connection, rawTx, opts)];
                    case 3:
                        txId = _b.sent();
                        return [2 /*return*/, txId];
                }
            });
        });
    };
    /**
     * Similar to `send`, but for an array of transactions and signers.
     */
    Provider.prototype.sendAll = function (reqs, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var blockhash, txs, signedTxs, sigs, k, tx, rawTx, _a, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (opts === undefined) {
                            opts = this.opts;
                        }
                        return [4 /*yield*/, this.connection.getRecentBlockhash(opts.preflightCommitment)];
                    case 1:
                        blockhash = _c.sent();
                        txs = reqs.map(function (r) {
                            var tx = r.tx;
                            var signers = r.signers;
                            if (signers === undefined) {
                                signers = [];
                            }
                            tx.feePayer = _this.wallet.publicKey;
                            tx.recentBlockhash = blockhash.blockhash;
                            signers
                                .filter(function (s) { return s !== undefined; })
                                .forEach(function (kp) {
                                tx.partialSign(kp);
                            });
                            return tx;
                        });
                        return [4 /*yield*/, this.wallet.signAllTransactions(txs)];
                    case 2:
                        signedTxs = _c.sent();
                        sigs = [];
                        k = 0;
                        _c.label = 3;
                    case 3:
                        if (!(k < txs.length)) return [3 /*break*/, 6];
                        tx = signedTxs[k];
                        rawTx = tx.serialize();
                        _b = (_a = sigs).push;
                        return [4 /*yield*/, (0, sendAndConfirmRawTransaction)(this.connection, rawTx, opts)];
                    case 4:
                        _b.apply(_a, [_c.sent()]);
                        _c.label = 5;
                    case 5:
                        k += 1;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/, sigs];
                }
            });
        });
    };
    /**
     * Simulates the given transaction, returning emitted logs from execution.
     *
     * @param tx      The transaction to send.
     * @param signers The set of signers in addition to the provdier wallet that
     *                will sign the transaction.
     * @param opts    Transaction confirmation options.
     */
    Provider.prototype.simulate = function (tx, signers, opts) {
        var _a, _b, _c;
        if (opts === void 0) { opts = this.opts; }
        return __awaiter(this, void 0, void 0, function () {
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (signers === undefined) {
                            signers = [];
                        }
                        tx.feePayer = this.wallet.publicKey;
                        _d = tx;
                        return [4 /*yield*/, this.connection.getRecentBlockhash((_a = opts.preflightCommitment) !== null && _a !== void 0 ? _a : this.opts.preflightCommitment)];
                    case 1:
                        _d.recentBlockhash = (_e.sent()).blockhash;
                        return [4 /*yield*/, this.wallet.signTransaction(tx)];
                    case 2:
                        _e.sent();
                        signers
                            .filter(function (s) { return s !== undefined; })
                            .forEach(function (kp) {
                            tx.partialSign(kp);
                        });
                        return [4 /*yield*/, simulateTransaction(this.connection, tx, (_c = (_b = opts.commitment) !== null && _b !== void 0 ? _b : this.opts.commitment) !== null && _c !== void 0 ? _c : "recent")];
                    case 3: return [2 /*return*/, _e.sent()];
                }
            });
        });
    };
    return Provider;
}());
export default Provider;
// Copy of Connection.simulateTransaction that takes a commitment parameter.
export function simulateTransaction(connection, transaction, commitment) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, signData, wireTransaction, encodedTransaction, config, args, res;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // @ts-ignore
                    _a = transaction;
                    return [4 /*yield*/, connection._recentBlockhash(
                        // @ts-ignore
                        connection._disableBlockhashCaching)];
                case 1:
                    // @ts-ignore
                    _a.recentBlockhash = _b.sent();
                    signData = transaction.serializeMessage();
                    wireTransaction = transaction._serialize(signData);
                    encodedTransaction = wireTransaction.toString("base64");
                    config = { encoding: "base64", commitment: commitment };
                    args = [encodedTransaction, config];
                    return [4 /*yield*/, connection._rpcRequest("simulateTransaction", args)];
                case 2:
                    res = _b.sent();
                    if (res.error) {
                        throw new Error("failed to simulate transaction: " + res.error.message);
                    }
                    return [2 /*return*/, res.result];
            }
        });
    });
}
/**
 * Sets the default provider on the client.
 */
 export function setProvider(provider) {
    _provider = provider;
}

/**
 * Returns the default provider being used by the client.
 */
 export function getProvider() {
    if (_provider === null) {
        return Provider.local();
    }
    return _provider;
}

// Global provider used as the default when a provider is not given.
var _provider = null;
