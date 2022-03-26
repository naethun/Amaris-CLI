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
exports.shortenAddress = exports.mintOneToken = exports.getCandyMachineCreator = exports.getCandyMachineState = exports.awaitTransactionSignatureConfirmation = exports.CANDY_MACHINE_PROGRAM = void 0;
const anchor = __importStar(require("@project-serum/anchor"));
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const connection_1 = require("./depend/connection");
const utils_1 = require("./depend/utils");

exports.CANDY_MACHINE_PROGRAM = new anchor.web3.PublicKey('cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ');
const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

const awaitTransactionSignatureConfirmation = (txid, timeout, connection, queryStatus = false) => __awaiter(void 0, void 0, void 0, function* () {
    let done = false;
    let status = {
        slot: 0,
        confirmations: 0,
        err: null,
    };
    let subId = 0;
    status = yield new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        setTimeout(() => {
            if (done) {
                return;
            }
            done = true;
            reject({ timeout: true });
        }, timeout);
        while (!done && queryStatus) {
            // eslint-disable-next-line no-loop-func
            (() => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const signatureStatuses = yield connection.getSignatureStatuses([
                        txid,
                    ]);
                    status = signatureStatuses && signatureStatuses.value[0];
                    if (!done) {
                        if (!status) {
                        }
                        else if (status.err) {
                            done = true;
                            reject(status.err);
                        }
                        else if (!status.confirmations) {
                        }
                        else {
                            done = true;
                            resolve(status);
                        }
                    }
                }
                catch (e) {
                    if (!done) {
                    }
                }
            }))();
            yield sleep(2000);
        }
    }));
    //@ts-ignore
    if (connection._signatureSubscriptions[subId]) {
        connection.removeSignatureListener(subId);
    }
    done = true;
    return status;
});
exports.awaitTransactionSignatureConfirmation = awaitTransactionSignatureConfirmation;
const createAssociatedTokenAccountInstruction = (associatedTokenAddress, payer, walletAddress, splTokenMintAddress) => {
    const keys = [
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
        { pubkey: walletAddress, isSigner: false, isWritable: false },
        { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
        {
            pubkey: anchor.web3.SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
        { pubkey: spl_token_1.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        {
            pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
    ];
    return new anchor.web3.TransactionInstruction({
        keys,
        programId: utils_1.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
        data: Buffer.from([]),
    });
};
const getCandyMachineState = (anchorWallet, candyMachineId, connection) => __awaiter(void 0, void 0, void 0, function* () {
    const provider = new anchor.Provider(connection, anchorWallet, {
        preflightCommitment: 'recent',
    });
    const idl = yield anchor.Program.fetchIdl(exports.CANDY_MACHINE_PROGRAM, provider);
    const program = new anchor.Program(idl, exports.CANDY_MACHINE_PROGRAM, provider);
    const state = yield program.account.candyMachine.fetch(candyMachineId);
    const itemsAvailable = state.data.itemsAvailable.toNumber();
    const itemsRedeemed = state.itemsRedeemed.toNumber();
    const itemsRemaining = itemsAvailable - itemsRedeemed;
    const presale = state.data.whitelistMintSettings &&
        state.data.whitelistMintSettings.presale &&
        (!state.data.goLiveDate ||
            state.data.goLiveDate.toNumber() > new Date().getTime() / 1000);
    return {
        id: candyMachineId,
        program,
        state: {
            itemsAvailable,
            itemsRedeemed,
            itemsRemaining,
            isSoldOut: itemsRemaining === 0,
            isActive: (presale ||
                state.data.goLiveDate.toNumber() < new Date().getTime() / 1000) &&
                (state.data.endSettings
                    ? state.data.endSettings.endSettingType.date
                        ? state.data.endSettings.number.toNumber() > new Date().getTime() / 1000
                        : itemsRedeemed < state.data.endSettings.number.toNumber()
                    : true),
            isPresale: presale,
            goLiveDate: state.data.goLiveDate,
            treasury: state.wallet,
            tokenMint: state.tokenMint,
            gatekeeper: state.data.gatekeeper,
            endSettings: state.data.endSettings,
            whitelistMintSettings: state.data.whitelistMintSettings,
            hiddenSettings: state.data.hiddenSettings,
            price: state.data.price,
        },
    };
});

const get_cmv2_metadata = (anchorWallet, candyMachineId, connection) => __awaiter(void 0, void 0, void 0, function* () {
    
    const cm_program = new anchor.web3.PublicKey('cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ');

    const provider = new anchor.Provider(connection, anchorWallet, {
        preflightCommitment: 'recent',
    });
    
    const idl = yield anchor.Program.fetchIdl(cm_program, provider);
    const program = new anchor.Program(idl, cm_program, provider);
    const state = yield program.account.candyMachine.fetch(candyMachineId);
    const itemsAvailable = state.data.itemsAvailable.toNumber();
    const itemsRedeemed = state.itemsRedeemed.toNumber();
    return {
        state: {
            itemsAvailable,
            itemsRedeemed,
        },
    };
});

const get_mecm_metadata = (anchorWallet, candyMachineId, connection) => __awaiter(void 0, void 0, void 0, function* () {
    
    const cm_program = new anchor.web3.PublicKey('CMZYPASGWeTz7RNGHaRJfCq2XQ5pYK6nDvVQxzkH51zb');

    const provider = new anchor.Provider(connection, anchorWallet, {
        preflightCommitment: 'recent',
    });
    
    const idl = yield anchor.Program.fetchIdl(cm_program, provider);
    const program = new anchor.Program(idl, cm_program, provider);
    const state = yield program.account.candyMachine.fetch(candyMachineId);
    const itemsAvailable = state.itemsAvailable.toNumber();
    const itemsRedeemed = state.itemsRedeemedNormal.toNumber();
    return {
        state: {

            itemsAvailable,
            itemsRedeemed
        },
    };
});

exports.getCandyMachineState = getCandyMachineState;
exports.get_cmv2_metadata = get_cmv2_metadata;
exports.get_mecm_metadata = get_mecm_metadata;

const getMasterEdition = (mint) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield anchor.web3.PublicKey.findProgramAddress([
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from('edition'),
    ], TOKEN_METADATA_PROGRAM_ID))[0];
});
const getMetadata = (mint) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield anchor.web3.PublicKey.findProgramAddress([
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
    ], TOKEN_METADATA_PROGRAM_ID))[0];
});
const getCandyMachineCreator = (candyMachine) => __awaiter(void 0, void 0, void 0, function* () {
    return yield anchor.web3.PublicKey.findProgramAddress([Buffer.from('candy_machine'), candyMachine.toBuffer()], exports.CANDY_MACHINE_PROGRAM);
});
exports.getCandyMachineCreator = getCandyMachineCreator;
const mintOneToken = (candyMachine, payer) => __awaiter(void 0, void 0, void 0, function* () {
    const mint = anchor.web3.Keypair.generate();
    const userTokenAccountAddress = (yield (0, utils_1.getAtaForMint)(mint.publicKey, payer))[0];
    const userPayingAccountAddress = candyMachine.state.tokenMint
        ? (yield (0, utils_1.getAtaForMint)(candyMachine.state.tokenMint, payer))[0]
        : payer;
    const candyMachineAddress = candyMachine.id;
    const remainingAccounts = [];
    const signers = [mint];
    const cleanupInstructions = [];
    const instructions = [
        anchor.web3.SystemProgram.createAccount({
            fromPubkey: payer,
            newAccountPubkey: mint.publicKey,
            space: spl_token_1.MintLayout.span,
            lamports: yield candyMachine.program.provider.connection.getMinimumBalanceForRentExemption(spl_token_1.MintLayout.span),
            programId: spl_token_1.TOKEN_PROGRAM_ID,
        }),
        spl_token_1.Token.createInitMintInstruction(spl_token_1.TOKEN_PROGRAM_ID, mint.publicKey, 0, payer, payer),
        createAssociatedTokenAccountInstruction(userTokenAccountAddress, payer, payer, mint.publicKey),
        spl_token_1.Token.createMintToInstruction(spl_token_1.TOKEN_PROGRAM_ID, mint.publicKey, userTokenAccountAddress, payer, [], 1),
    ];
    if (candyMachine.state.gatekeeper) {
        remainingAccounts.push({
            pubkey: (yield (0, utils_1.getNetworkToken)(payer, candyMachine.state.gatekeeper.gatekeeperNetwork))[0],
            isWritable: true,
            isSigner: false,
        });
        if (candyMachine.state.gatekeeper.expireOnUse) {
            remainingAccounts.push({
                pubkey: utils_1.CIVIC,
                isWritable: false,
                isSigner: false,
            });
            remainingAccounts.push({
                pubkey: (yield (0, utils_1.getNetworkExpire)(candyMachine.state.gatekeeper.gatekeeperNetwork))[0],
                isWritable: false,
                isSigner: false,
            });
        }
    }
    if (candyMachine.state.whitelistMintSettings) {
        const mint = new anchor.web3.PublicKey(candyMachine.state.whitelistMintSettings.mint);
        const whitelistToken = (yield (0, utils_1.getAtaForMint)(mint, payer))[0];
        remainingAccounts.push({
            pubkey: whitelistToken,
            isWritable: true,
            isSigner: false,
        });
        if (candyMachine.state.whitelistMintSettings.mode.burnEveryTime) {
            const whitelistBurnAuthority = anchor.web3.Keypair.generate();
            remainingAccounts.push({
                pubkey: mint,
                isWritable: true,
                isSigner: false,
            });
            remainingAccounts.push({
                pubkey: whitelistBurnAuthority.publicKey,
                isWritable: false,
                isSigner: true,
            });
            signers.push(whitelistBurnAuthority);
            const exists = yield candyMachine.program.provider.connection.getAccountInfo(whitelistToken);
            if (exists) {
                instructions.push(spl_token_1.Token.createApproveInstruction(spl_token_1.TOKEN_PROGRAM_ID, whitelistToken, whitelistBurnAuthority.publicKey, payer, [], 1));
                cleanupInstructions.push(spl_token_1.Token.createRevokeInstruction(spl_token_1.TOKEN_PROGRAM_ID, whitelistToken, payer, []));
            }
        }
    }
    if (candyMachine.state.tokenMint) {
        const transferAuthority = anchor.web3.Keypair.generate();
        signers.push(transferAuthority);
        remainingAccounts.push({
            pubkey: userPayingAccountAddress,
            isWritable: true,
            isSigner: false,
        });
        remainingAccounts.push({
            pubkey: transferAuthority.publicKey,
            isWritable: false,
            isSigner: true,
        });
        instructions.push(spl_token_1.Token.createApproveInstruction(spl_token_1.TOKEN_PROGRAM_ID, userPayingAccountAddress, transferAuthority.publicKey, payer, [], candyMachine.state.price.toNumber()));
        cleanupInstructions.push(spl_token_1.Token.createRevokeInstruction(spl_token_1.TOKEN_PROGRAM_ID, userPayingAccountAddress, payer, []));
    }
    const metadataAddress = yield getMetadata(mint.publicKey);
    const masterEdition = yield getMasterEdition(mint.publicKey);
    const [candyMachineCreator, creatorBump] = yield (0, exports.getCandyMachineCreator)(candyMachineAddress);
    instructions.push(yield candyMachine.program.instruction.mintNft(creatorBump, {
        accounts: {
            candyMachine: candyMachineAddress,
            candyMachineCreator,
            payer: payer,
            wallet: candyMachine.state.treasury,
            mint: mint.publicKey,
            metadata: metadataAddress,
            masterEdition,
            mintAuthority: payer,
            updateAuthority: payer,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            systemProgram: web3_js_1.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
            recentBlockhashes: anchor.web3.SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
            instructionSysvarAccount: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        },
        remainingAccounts: remainingAccounts.length > 0 ? remainingAccounts : undefined,
    }));
    try {
        return (yield (0, connection_1.sendTransactions)(candyMachine.program.provider.connection, candyMachine.program.provider.wallet, [instructions, cleanupInstructions], [signers, []])).txs.map(t => t.txid);
    }
    catch (e) {
    }
    return [];
});
exports.mintOneToken = mintOneToken;
const shortenAddress = (address, chars = 4) => {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};
exports.shortenAddress = shortenAddress;
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};