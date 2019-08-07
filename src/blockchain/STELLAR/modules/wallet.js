import StellarSdk from 'stellar-sdk'
import config from './config'

const xlmServer = new StellarSdk.Server(config.provider)

export default class Wallet {
    constructor () {
        this.xlmServer = xlmServer
    }

    /**
     * @description will create a new account (wallet)
     */
    create () {
        return new Promise(async (resolve, reject) => {
            var pair = StellarSdk.Keypair.random()
            resolve({ public: pair.publicKey(), private: pair.secret() })
        })
    }

    /**
     * @param {object} tx unsigned transaction object
     * @param {string} privateKey privatekey of account to sign transaction
     */
    signTransaction (tx, privateKey) {
        return new Promise(async (resolve, reject) => {
            try {
                const sourceKeypair = StellarSdk.Keypair.fromSecret(privateKey)
                const sourcePublicKey = sourceKeypair.publicKey()

                const account = await xlmServer.loadAccount(sourcePublicKey)

                var transaction = new StellarSdk.TransactionBuilder(account)
                .addOperation(
                    StellarSdk.Operation.payment({
                        destination: tx.to,
                        asset: StellarSdk.Asset.native(),
                        amount: tx.value.toString()
                    })
                )
                .build();
                transaction.sign(sourceKeypair);
                resolve(transaction);
            }
            catch (e) {
                console.log(e)
                reject("error_signing_transaction");
            }
        })
    }

    /**
     * @param {string} privateKey of account to get
     */
    getAccount (privateKey) {
        return new Promise(async (resolve, reject) => {
            try {
                var source = StellarSdk.Keypair.fromSecret(privateKey)
                var publicKey = source.publicKey()

                resolve(publicKey)
            }
            catch (e) {
                reject("error_getting_account")
            }
        })
    }
}