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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wallet_provider_1 = require("@dojima-wallet/wallet-provider");
const types_1 = require("@dojima-wallet/types");
const utils_1 = require("@dojima-wallet/utils");
const crypto_1 = require("@dojima-wallet/crypto");
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const ed25519_hd_key_1 = require("ed25519-hd-key");
const bip39_1 = require("bip39");
const web3_js_1 = require("@solana/web3.js");
class SolanaWalletProvider extends wallet_provider_1.WalletProvider {
    constructor(options) {
        const { network, mnemonic, derivationPath } = options;
        super({ network });
        this._network = network;
        this._mnemonic = mnemonic;
        this._derivationPath = derivationPath;
        this._addressCache = {};
    }
    isWalletAvailable() {
        return __awaiter(this, void 0, void 0, function* () {
            const addresses = yield this.getAddresses();
            return addresses.length > 0;
        });
    }
    getAddresses() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._addressCache[this._mnemonic]) {
                return [this._addressCache[this._mnemonic]];
            }
            const account = yield this._getSigner();
            const result = new types_1.Address({
                address: account.publicKey.toString(),
                publicKey: account.publicKey.toString(),
                derivationPath: this._derivationPath,
            });
            this._addressCache[this._mnemonic] = result;
            return [result];
        });
    }
    getUnusedAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            const addresses = yield this.getAddresses();
            return addresses[0];
        });
    }
    getUsedAddresses() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getAddresses();
        });
    }
    sendTransaction(options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield this._getSigner();
            const transaction = new web3_js_1.Transaction();
            if (!options.instructions && !options.to) {
                const programId = yield this.getMethod("_deploy")(this._signer, options.bytecode);
                yield this.getMethod("_waitForContractToBeExecutable")(programId);
                const [final] = yield this.getMethod("_getAddressHistory")(programId);
                return yield this.getMethod("getTransactionReceipt")([final.signature]);
            }
            else if (!options.instructions) {
                const to = new web3_js_1.PublicKey((0, utils_1.addressToString)(options.to));
                const lamports = Number(options.value);
                transaction.add(yield this._sendBetweenAccounts(to, lamports));
            }
            else {
                options.instructions.forEach((instruction) => transaction.add(instruction));
            }
            let accounts = [this._signer];
            if (options.accounts) {
                accounts = [this._signer, ...options.accounts];
            }
            const hash = yield this.getMethod("_sendTransaction")(transaction, accounts);
            return {
                hash,
                value: ((_a = options.value) === null || _a === void 0 ? void 0 : _a.toNumber()) || 0,
                _raw: {},
            };
        });
    }
    signMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._getSigner();
            const buffer = Buffer.from(message);
            const signature = tweetnacl_1.default.sign.detached(buffer, crypto_1.base58.decode(crypto_1.base58.encode(this._signer.secretKey)));
            return crypto_1.base58.encode(signature);
        });
    }
    getConnectedNetwork() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._network;
        });
    }
    canUpdateFee() {
        return false;
    }
    sendSweepTransaction(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const addresses = yield this.getAddresses();
            const [balance, blockHash] = yield Promise.all([
                this.getMethod("getBalance")(addresses),
                this.getMethod("getRecentBlockhash")(),
            ]);
            const _fee = blockHash.feeCalculator.lamportsPerSignature;
            return yield this.sendTransaction({
                to: (0, utils_1.addressToString)(address),
                value: balance.minus(_fee),
            });
        });
    }
    _mnemonicToSeed(mnemonic) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, bip39_1.validateMnemonic)(mnemonic)) {
                throw new Error("Invalid seed words");
            }
            const seed = yield (0, bip39_1.mnemonicToSeed)(mnemonic);
            return Buffer.from(seed).toString("hex");
        });
    }
    _getSigner() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._signer) {
                yield this._setSigner();
            }
            return this._signer;
        });
    }
    _sendBetweenAccounts(recipient, lamports) {
        return __awaiter(this, void 0, void 0, function* () {
            const signer = yield this._getSigner();
            return web3_js_1.SystemProgram.transfer({
                fromPubkey: signer.publicKey,
                toPubkey: recipient,
                lamports,
            });
        });
    }
    _setSigner() {
        return __awaiter(this, void 0, void 0, function* () {
            const seed = yield this._mnemonicToSeed(this._mnemonic);
            const derivedSeed = (0, ed25519_hd_key_1.derivePath)(this._derivationPath, seed).key;
            const account = web3_js_1.Keypair.fromSecretKey(tweetnacl_1.default.sign.keyPair.fromSeed(derivedSeed).secretKey);
            this._signer = account;
        });
    }
}
exports.default = SolanaWalletProvider;
