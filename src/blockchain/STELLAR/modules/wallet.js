import StellarSdk from 'stellar-sdk'
import config from './config'
import Api    from './api';
import Query  from '../../../queryBuilder';

if (config.network == "testnet")
    StellarSdk.Network.useTestNetwork();
    
else if (config.network == "mainnet")
    StellarSdk.Network.usePublicNetwork()

const xlmServer = new StellarSdk.Server(config.provider)
const api = new Api()

const query = new Query()

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
                const fee = await xlmServer.fetchBaseFee();

                query.get_json(api.getBalance(tx.to))
                .then(() => {
                    var transaction = new StellarSdk.TransactionBuilder(account, { fee })
                    .addOperation(
                        StellarSdk.Operation.payment({
                            destination: tx.to,
                            asset: StellarSdk.Asset.native(),
                            amount: tx.value.toString()
                        })
                    )
                    .setTimeout(30)
                    .build();

                    transaction.sign(sourceKeypair);
                    resolve(transaction);
                })
                .catch(() => {
                    var transaction = new StellarSdk.TransactionBuilder(account, { fee })
                    .addOperation(
                        StellarSdk.Operation.createAccount({
                            destination: tx.to,
                            startingBalance: tx.value.toString()
                        })
                    )
                    .setTimeout(30)
                    .build();
                    
                    transaction.sign(sourceKeypair);
                    resolve(transaction);
                })
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