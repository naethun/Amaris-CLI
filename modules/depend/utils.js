"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssociatedTokenAccountInstruction = exports.getNetworkToken = exports.getNetworkExpire = exports.getAtaForMint = exports.CIVIC = exports.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = exports.formatNumber = exports.toDate = void 0;
const anchor = __importStar(require("@project-serum/anchor"));
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const web3_js_2 = require("@solana/web3.js");
const toDate = (value) => {
    if (!value) {
        return;
    }
    return new Date(value.toNumber() * 1000);
};
exports.toDate = toDate;
const numberFormater = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});
exports.formatNumber = {
    format: (val) => {
        if (!val) {
            return '--';
        }
        return numberFormater.format(val);
    },
    asNumber: (val) => {
        if (!val) {
            return undefined;
        }
        return val.toNumber() / web3_js_2.LAMPORTS_PER_SOL;
    },
};
exports.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new anchor.web3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
exports.CIVIC = new anchor.web3.PublicKey('gatem74V238djXdzWnJf94Wo1DcnuGkfijbf3AuBhfs');
const getAtaForMint = (mint, buyer) => __awaiter(void 0, void 0, void 0, function* () {
    return yield anchor.web3.PublicKey.findProgramAddress([buyer.toBuffer(), spl_token_1.TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()], exports.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID);
});
exports.getAtaForMint = getAtaForMint;
const getNetworkExpire = (gatekeeperNetwork) => __awaiter(void 0, void 0, void 0, function* () {
    return yield anchor.web3.PublicKey.findProgramAddress([gatekeeperNetwork.toBuffer(), Buffer.from('expire')], exports.CIVIC);
});
exports.getNetworkExpire = getNetworkExpire;
const getNetworkToken = (wallet, gatekeeperNetwork) => __awaiter(void 0, void 0, void 0, function* () {
    return yield anchor.web3.PublicKey.findProgramAddress([
        wallet.toBuffer(),
        Buffer.from('gateway'),
        Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]),
        gatekeeperNetwork.toBuffer(),
    ], exports.CIVIC);
});
exports.getNetworkToken = getNetworkToken;
function createAssociatedTokenAccountInstruction(associatedTokenAddress, payer, walletAddress, splTokenMintAddress) {
    const keys = [
        {
            pubkey: payer,
            isSigner: true,
            isWritable: true,
        },
        {
            pubkey: associatedTokenAddress,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: walletAddress,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: splTokenMintAddress,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: web3_js_1.SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: spl_token_1.TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: web3_js_2.SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
    ];
    return new web3_js_2.TransactionInstruction({
        keys,
        programId: exports.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
        data: Buffer.from([]),
    });
}
exports.createAssociatedTokenAccountInstruction = createAssociatedTokenAccountInstruction;
