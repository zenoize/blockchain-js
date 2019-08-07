import { generateWallet } from 'minterjs-wallet'
import { walletFromPrivateKey } from 'minterjs-wallet';
import { Buffer } from 'safe-buffer';
import MinterTxSignature from 'minterjs-tx/src/tx-signature';
import MinterApi from "minter-js-sdk/src/api";
import GetNonce from 'minter-js-sdk/src/api/get-nonce';
import config from './config'

const minterApi = new MinterApi(
    (config.network == "testnet")
        ? { apiType: 'node', baseURL: config.provider, chainId: 2 }
        : { apiType: 'gate', baseURL: config.gate, chainId: 1 }
)

export default class Wallet {
    constructor () {}

    /**
     * @description will create a new account (wallet)
     */
    create () {
        return new Promise(async (resolve, reject) => {
            const source = generateWallet()
            resolve({
                public: "Mx" + source.getAddress().toString('hex'),
                private: source.getPrivateKey().toString('hex'),
                seed: source.getMnemonic()
            })
        })
    }

    getNonce (from) {
        return new Promise(async (resolve, reject) => {
            const getNonce = new GetNonce(minterApi);
            getNonce(from)
            .then((nonce) => {
                resolve("0x" + nonce.toString(16))
            })
            .catch(e => {
                console.log(e)
                reject("error_getting_nonce")
            })
        })
    }

    getAccount (privateKey) {
        return new Promise(async (resolve, reject) => {
            try {
                const privateKeyBuffer = Buffer.from(privateKey, 'hex')
                const wallet = walletFromPrivateKey(privateKeyBuffer);
    
                resolve("Mx" + wallet.getAddress().toString('hex'))
            }
            catch (e) {
                console.log(e)
                reject("error_getting_account")
            }
        })
    }

    signTransaction (tx, privateKey) {
        const that = this
        return new Promise(async (resolve, reject) => {
            try {
                const keyBuffer = Buffer.from(privateKey, 'hex');
                const account = await that.getAccount(privateKey)
                const nonce = await that.getNonce(account)
                tx.nonce = nonce

                tx.signatureData = (new MinterTxSignature()).sign(tx.hash(false), keyBuffer).serialize();
    
                const serializedTx = tx.serialize().toString('hex');
    
                resolve(serializedTx)
            }
            catch (e) {
                console.log(e)
                if (e != "error_getting_account" && e != "error_getting_nonce")
                    reject ("error_signing_transaction")

                else 
                    reject(e)
            }
        })
    }
}