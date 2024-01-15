import { TransactionExtended, MempoolTransactionExtended, TransactionMinerInfo } from '../mempool.interfaces';
import { IEsploraApi } from './bitcoin/esplora-api.interface';
import { Common } from './common';
import bitcoinApi, { bitcoinCoreApi } from './bitcoin/bitcoin-api-factory';
import * as bitcoinjs from 'bitcoinjs-lib';
import logger from '../logger';
import config from '../config';
import pLimit from '../utils/p-limit';

class TransactionUtils {
  constructor() { }

  public stripCoinbaseTransaction(tx: TransactionExtended): TransactionMinerInfo {
    return {
      vin: [{
        scriptsig: tx.vin[0].scriptsig || tx.vin[0]['coinbase']
      }],
      vout: tx.vout
        .map((vout) => ({
          scriptpubkey_address: vout.scriptpubkey_address,
          scriptpubkey_asm: vout.scriptpubkey_asm,
          value: vout.value
        }))
        .filter((vout) => vout.value)
    };
  }

  // Wrapper for $getTransactionExtended with an automatic retry direct to Core if the first API request fails.
  // Propagates any error from the retry request.
  public async $getTransactionExtendedRetry(txid: string, addPrevouts = false, lazyPrevouts = false, forceCore = false, addMempoolData = false): Promise<TransactionExtended> {
    try {
      const result = await this.$getTransactionExtended(txid, addPrevouts, lazyPrevouts, forceCore, addMempoolData);
      if (result) {
        return result;
      } else {
        logger.err(`Cannot fetch tx ${txid}. Reason: backend returned null data`);
      }
    } catch (e) {
      logger.err(`Cannot fetch tx ${txid}. Reason: ` + (e instanceof Error ? e.message : e));
    }
    // retry direct from Core if first request failed
    return this.$getTransactionExtended(txid, addPrevouts, lazyPrevouts, true, addMempoolData);
  }

  /**
   * @param txId
   * @param addPrevouts
   * @param lazyPrevouts
   * @param forceCore - See https://github.com/mempool/mempool/issues/2904
   */
  public async $getTransactionExtended(txId: string, addPrevouts = false, lazyPrevouts = false, forceCore = false, addMempoolData = false): Promise<TransactionExtended> {
    let transaction: IEsploraApi.Transaction;
    if (forceCore === true) {
      transaction  = await bitcoinCoreApi.$getRawTransaction(txId, false, addPrevouts, lazyPrevouts);
    } else {
      transaction  = await bitcoinApi.$getRawTransaction(txId, false, addPrevouts, lazyPrevouts);
    }

    if (addMempoolData || !transaction?.status?.confirmed) {
      return this.extendMempoolTransaction(transaction);
    } else {
      return this.extendTransaction(transaction);
    }
  }

  public async $getMempoolTransactionExtended(txId: string, addPrevouts = false, lazyPrevouts = false, forceCore = false): Promise<MempoolTransactionExtended> {
    return (await this.$getTransactionExtended(txId, addPrevouts, lazyPrevouts, forceCore, true)) as MempoolTransactionExtended;
  }

  public async $getMempoolTransactionsExtended(txids: string[], addPrevouts = false, lazyPrevouts = false, forceCore = false): Promise<MempoolTransactionExtended[]> {
    if (forceCore || config.MEMPOOL.BACKEND !== 'esplora') {
      const limiter = pLimit(8); // Run 8 requests at a time
      const results = await Promise.allSettled(txids.map(
        txid => limiter(() => this.$getMempoolTransactionExtended(txid, addPrevouts, lazyPrevouts, forceCore))
      ));
      return results.filter(reply => reply.status === 'fulfilled')
        .map(r => (r as PromiseFulfilledResult<MempoolTransactionExtended>).value);
    } else {
      const transactions = await bitcoinApi.$getMempoolTransactions(txids);
      return transactions.map(transaction => {
        return this.extendMempoolTransaction(transaction);
      });
    }
  }

  public extendTransaction(transaction: IEsploraApi.Transaction): TransactionExtended {
    // @ts-ignore
    if (transaction.vsize) {
      // @ts-ignore
      return transaction;
    }
    const feePerVbytes = (transaction.fee || 0) / (transaction.weight / 4);
    const transactionExtended: TransactionExtended = Object.assign({
      vsize: Math.round(transaction.weight / 4),
      feePerVsize: feePerVbytes,
      effectiveFeePerVsize: feePerVbytes,
    }, transaction);
    if (!transaction?.status?.confirmed && !transactionExtended.firstSeen) {
      transactionExtended.firstSeen = Math.round((Date.now() / 1000));
    }
    return transactionExtended;
  }

  public extendMempoolTransaction(transaction: IEsploraApi.Transaction): MempoolTransactionExtended {
    const vsize = Math.ceil(transaction.weight / 4);
    const fractionalVsize = (transaction.weight / 4);
    let sigops = transaction.sigops != null ? transaction.sigops : this.countSigops(transaction);
    // https://github.com/bitcoin/bitcoin/blob/e9262ea32a6e1d364fb7974844fadc36f931f8c6/src/policy/policy.cpp#L295-L298
    const adjustedVsize = Math.max(fractionalVsize, sigops *  5); // adjusted vsize = Max(weight, sigops * bytes_per_sigop) / witness_scale_factor
    const feePerVbytes = (transaction.fee || 0) / fractionalVsize;
    const adjustedFeePerVsize = (transaction.fee || 0) / adjustedVsize;
    const transactionExtended: MempoolTransactionExtended = Object.assign(transaction, {
      order: this.txidToOrdering(transaction.txid),
      vsize: Math.round(transaction.weight / 4),
      adjustedVsize,
      sigops,
      feePerVsize: feePerVbytes,
      adjustedFeePerVsize: adjustedFeePerVsize,
      effectiveFeePerVsize: adjustedFeePerVsize,
    });
    if (!transactionExtended?.status?.confirmed && !transactionExtended.firstSeen) {
      transactionExtended.firstSeen = Math.round((Date.now() / 1000));
    }
    return transactionExtended;
  }

  public hex2ascii(hex: string) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  }

  public countScriptSigops(script: string, isRawScript: boolean = false, witness: boolean = false): number {
    let sigops = 0;
    // count OP_CHECKSIG and OP_CHECKSIGVERIFY
    sigops += (script.match(/OP_CHECKSIG/g)?.length || 0);

    // count OP_CHECKMULTISIG and OP_CHECKMULTISIGVERIFY
    if (isRawScript) {
      // in scriptPubKey or scriptSig, always worth 20
      sigops += 20 * (script.match(/OP_CHECKMULTISIG/g)?.length || 0);
    } else {
      // in redeem scripts and witnesses, worth N if preceded by OP_N, 20 otherwise
      const matches = script.matchAll(/(?:OP_(?:PUSHNUM_)?(\d+))? OP_CHECKMULTISIG/g);
      for (const match of matches) {
        const n = parseInt(match[1]);
        if (Number.isInteger(n)) {
          sigops += n;
        } else {
          sigops += 20;
        }
      }
    }

    return witness ? sigops : (sigops * 4);
  }

  public countSigops(transaction: IEsploraApi.Transaction): number {
    let sigops = 0;

    for (const input of transaction.vin) {
      if (input.scriptsig_asm) {
        sigops += this.countScriptSigops(input.scriptsig_asm, true);
      }
      if (input.prevout) {
        switch (true) {
          case input.prevout.scriptpubkey_type === 'p2sh' && input.witness?.length === 2 && input.scriptsig && input.scriptsig.startsWith('160014'):
          case input.prevout.scriptpubkey_type === 'v0_p2wpkh':
            sigops += 1;
            break;

          case input.prevout?.scriptpubkey_type === 'p2sh' && input.witness?.length && input.scriptsig && input.scriptsig.startsWith('220020'):
          case input.prevout.scriptpubkey_type === 'v0_p2wsh':
            if (input.witness?.length) {
              sigops += this.countScriptSigops(bitcoinjs.script.toASM(Buffer.from(input.witness[input.witness.length - 1], 'hex')), false, true);
            }
            break;

          case input.prevout.scriptpubkey_type === 'p2sh':
            if (input.inner_redeemscript_asm) {
              sigops += this.countScriptSigops(input.inner_redeemscript_asm);
            }
            break;
        }
      }
    }

    for (const output of transaction.vout) {
      if (output.scriptpubkey_asm) {
        sigops += this.countScriptSigops(output.scriptpubkey_asm, true);
      }
    }

    return sigops;
  }

  // returns the most significant 4 bytes of the txid as an integer
  public txidToOrdering(txid: string): number {
    return parseInt(
      txid.substr(62, 2) +
        txid.substr(60, 2) +
        txid.substr(58, 2) +
        txid.substr(56, 2),
      16
    );
  }

  public addInnerScriptsToVin(vin: IEsploraApi.Vin): void {
    if (!vin.prevout) {
      return;
    }

    if (vin.prevout.scriptpubkey_type === 'p2sh') {
      const redeemScript = vin.scriptsig_asm.split(' ').reverse()[0];
      vin.inner_redeemscript_asm = this.convertScriptSigAsm(redeemScript);
      if (vin.witness && vin.witness.length > 2) {
        const witnessScript = vin.witness[vin.witness.length - 1];
        vin.inner_witnessscript_asm = this.convertScriptSigAsm(witnessScript);
      }
    }

    if (vin.prevout.scriptpubkey_type === 'v0_p2wsh' && vin.witness) {
      const witnessScript = vin.witness[vin.witness.length - 1];
      vin.inner_witnessscript_asm = this.convertScriptSigAsm(witnessScript);
    }

    if (vin.prevout.scriptpubkey_type === 'v1_p2tr' && vin.witness) {
      const witnessScript = this.witnessToP2TRScript(vin.witness);
      if (witnessScript !== null) {
        vin.inner_witnessscript_asm = this.convertScriptSigAsm(witnessScript);
      }
    }
  }

  public convertScriptSigAsm(hex: string): string {
    const buf = Buffer.from(hex, 'hex');

    const b: string[] = [];

    let i = 0;
    while (i < buf.length) {
      const op = buf[i];
      if (op >= 0x01 && op <= 0x4e) {
        i++;
        let push: number;
        if (op === 0x4c) {
          push = buf.readUInt8(i);
          b.push('OP_PUSHDATA1');
          i += 1;
        } else if (op === 0x4d) {
          push = buf.readUInt16LE(i);
          b.push('OP_PUSHDATA2');
          i += 2;
        } else if (op === 0x4e) {
          push = buf.readUInt32LE(i);
          b.push('OP_PUSHDATA4');
          i += 4;
        } else {
          push = op;
          b.push('OP_PUSHBYTES_' + push);
        }

        const data = buf.slice(i, i + push);
        if (data.length !== push) {
          break;
        }

        b.push(data.toString('hex'));
        i += data.length;
      } else {
        if (op === 0x00) {
          b.push('OP_0');
        } else if (op === 0x4f) {
          b.push('OP_PUSHNUM_NEG1');
        } else if (op === 0xb1) {
          b.push('OP_CLTV');
        } else if (op === 0xb2) {
          b.push('OP_CSV');
        } else if (op === 0xba) {
          b.push('OP_CHECKSIGADD');
        } else {
          const opcode = bitcoinjs.script.toASM([ op ]);
          if (opcode && op < 0xfd) {
            if (/^OP_(\d+)$/.test(opcode)) {
              b.push(opcode.replace(/^OP_(\d+)$/, 'OP_PUSHNUM_$1'));
            } else {
              b.push(opcode);
            }
          } else {
            b.push('OP_RETURN_' + op);
          }
        }
        i += 1;
      }
    }

    return b.join(' ');
  }

  /**
   * This function must only be called when we know the witness we are parsing
   * is a taproot witness.
   * @param witness An array of hex strings that represents the witness stack of
   *                the input.
   * @returns null if the witness is not a script spend, and the hex string of
   *          the script item if it is a script spend.
   */
  public witnessToP2TRScript(witness: string[]): string | null {
    if (witness.length < 2) return null;
    // Note: see BIP341 for parsing details of witness stack

    // If there are at least two witness elements, and the first byte of the
    // last element is 0x50, this last element is called annex a and
    // is removed from the witness stack.
    const hasAnnex = witness[witness.length - 1].substring(0, 2) === '50';
    // If there are at least two witness elements left, script path spending is used.
    // Call the second-to-last stack element s, the script.
    // (Note: this phrasing from BIP341 assumes we've *removed* the annex from the stack)
    if (hasAnnex && witness.length < 3) return null;
    const positionOfScript = hasAnnex ? witness.length - 3 : witness.length - 2;
    return witness[positionOfScript];
  }
}

export default new TransactionUtils();
