import { Buffer } from "buffer";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { Wallet } from "./provider";

/**
 * Node only wallet.
 */
export default class NodeWallet implements Wallet {
  constructor(readonly payer: Keypair) {}

  static local(secret :any): NodeWallet {
    const process = require("process");
    console.log(`key eti`,secret)
    const payer = Keypair.fromSecretKey(
      Buffer.from(
        secret
      )
    );
    return new NodeWallet(payer);
  }

  async signTransaction(tx: Transaction): Promise<Transaction> {
    tx.partialSign(this.payer);
    return tx;
  }

  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    return txs.map((t) => {
      t.partialSign(this.payer);
      return t;
    });
  }

  get publicKey(): PublicKey {
    return this.payer.publicKey;
  }
}
