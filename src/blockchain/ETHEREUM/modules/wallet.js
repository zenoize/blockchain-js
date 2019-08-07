// delete global.bitcore
// import lightwallet from 'eth-lightwallet';
import config from './config';
import Util from './util';
// import EthJS from 'ethereumjs-tx/dist/index';

import { Accounts } from 'web3-eth-accounts';
import Eth from 'web3-eth';
import crypto from 'crypto';

import Web3 from 'web3'
const web3 = new Web3(new Web3.providers.HttpProvider(config.provider))

export default class Wallet {
    constructor () {
        this.eth = new Eth(
            config.provider,
            null,
        );
        this.util = new Util()
        this.accounts = new Accounts(
            config.provider,
            null,
        );
        // this.ethjs = EthJS
        // console.log(this.ethjs)
    }

    /**
     * @description will create a new account (wallet)
     */
    // create () {
    //     return new Promise(function (resolve, reject) {
    //         var secretSeed = lightwallet.keystore.generateRandomSeed();
    
    //         lightwallet.keystore.createVault({
    //             password: "password",
    //             hdPathString: "m/44'/60'/0'/0",
    //             seedPhrase: secretSeed
    //         }, function (err, ks) {
    //             if (err) reject(err);
    
    //             ks.keyFromPassword("password", function (err, pwDerivedKey) {
    //                 if (err) reject(err);
    
    //                 ks.generateNewAddress(pwDerivedKey, 1);
    //                 var addr = ks.getAddresses();
    //                 var key = ks.exportPrivateKey(addr[0], pwDerivedKey);
    
    //                 resolve({ public: addr[0], private: key, seed: secretSeed });
    //             });
    //         });
    //     })
    // }
    create () {
        return new Promise(async (resolve, reject) => {
            const account = await this.accounts.create(crypto.randomBytes(32).toString('hex'))
            resolve({ public:account.address, private:account.privateKey })
        })
    }

    getNonce (from) {
        return new Promise(async (resolve, reject) => {
            try {
                const nonce = await this.eth.getTransactionCount(from)
                resolve(this.util.to0xFromNum(nonce))
            }
            catch (e) {
                console.log(e)
                reject("error_getting_nonce")
            }
        })
    }

    /**
     * @param {string} privateKey of account to get
     */
    getAccount (privateKey) {
        const that = this
        return new Promise(function (resolve, reject) {
            try {
                var account = that.accounts.privateKeyToAccount(privateKey)
                resolve(account.address);
            }
            catch (e) {
                console.log(e);
                reject('error_getting_account');
            }
        })
    }

    /**
     * @param {object} tx unsigned transaction object
     * @param {string} privateKey privatekey of account to sign transaction
     */
    signTransaction (tx, privatekey) {
        const that = this
        return new Promise(async (resolve, reject) => {
            try {
                const privateBuff = Buffer.from(privatekey,'hex')
                const account = await that.getAccount(privatekey)
                tx.nonce = await that.getNonce(account)
                
                // const txobj = new that.ethjs(tx)
                const signed = await web3.eth.accounts.signTransaction(tx, privatekey)
                //       txobj.sign(privateBuff)
                      
                // const hexedTx = txobj.serialize().toString('hex')

                resolve(signed)
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