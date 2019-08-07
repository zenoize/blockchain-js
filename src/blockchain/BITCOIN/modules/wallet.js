import Query   from '../../../queryBuilder'
import bitcoin from 'bitcoinjs-lib'
import config  from './config'
import Util    from './util';
import Api     from './api';
// import TxDecoder from './decoder'

const query = new Query()
const btc_network = bitcoin.networks[config.network]

export default class Wallet {
    constructor (props) {
        this.util = new Util()
        this.api  = new Api()
        this.gasPrice = props
    }

    /**
     * @description will create a new account (wallet)
     */
    create () {
        return new Promise(function (resolve, reject) {
            const keyPair = bitcoin.ECPair.makeRandom({network: btc_network})
            const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network:btc_network })

            resolve({ public: address, private:keyPair.privateKey.toString('hex') })
        })
    }

    getNonce (from) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(true)
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
        return new Promise(function (resolve, reject) {
            try {
                var account = bitcoin.ECPair.fromWIF(privateKey)
                const { address } = bitcoin.payments.p2pkh({ pubkey: account.publicKey, network:btc_network })

                resolve(address)
            }
            catch (e) {
                console.log(e);
                reject('error_getting_account');
            }
        })
    }

    getUnspentOutputsWrapper (address) {
        return new Promise(async (resolve, reject) => {
            query.get_json(this.api.getUnspentOutputs(address))
            .then(data => {
                const txs = data.txs
                const response = {
                    unspent_outputs: []
                }
                for (let i = 0; i < txs.length; i++) {
                    if (txs[i].confirmations >= 6) {
                        for (let j = 0; j < txs[i].outputs.length; j++) {
                            const outputs = txs[i].outputs[j]
                            if (outputs.addresses.indexOf(address) != -1) 
                                response.unspent_outputs.push({
                                    tx_hash: txs[i].hash,
                                    tx_output_n: outputs.addresses.indexOf(address),
                                    value: outputs.value
                                })
                        }
                    }
                }
                resolve(response)
            })
            .catch(err => {
                console.log(err)
                reject("error_getting_outputs")
            })
        })
    }

    /**
     * @param {object} tx unsigned transaction object
     * @param {string} privateKey privatekey of account to sign transaction
     */
    signTransaction (tx, privatekey) {
        return new Promise(async (resolve, reject) => {
            try {
                const account = bitcoin.ECPair.fromPrivateKey(Buffer.from(privatekey, 'hex'), {network:btc_network})
                const p2pkh   = bitcoin.payments.p2pkh({ pubkey: account.publicKey, network:btc_network })
                const address = p2pkh.address

                const response = await this.getUnspentOutputsWrapper(address)
                const unspent  = response.unspent_outputs

                if (unspent.length == 1) {
                    tx.addInput(unspent[0].tx_hash, unspent[0].tx_output_n)

                    const unspent_amount = unspent[0].value // 5000
                    const spending       = tx.__tx.outs[0].value // 10000
                    const gasPrice       = await this.getGasPrice() // 1200
                    
                    if (unspent_amount < (spending + gasPrice))
                        throw "No free outputs to spend"

                    else {
                        const change_nogas = unspent_amount - spending // 4000
                        const change       = change_nogas - gasPrice // 2800

                        // adding change to transaction to return unspent to sender
                        tx.addOutput(address, change)
                    }

                    tx.sign(0, account)

                    const hexedTx = tx.build().toHex()
                    resolve(hexedTx)
                }

                if (unspent.length > 1) {
                    const spending = tx.__tx.outs[0].value // 10000
                    const gasPrice = await this.getGasPrice() // 1200 gasprice
                    const requiredBalance = spending + gasPrice

                    let unspent_amount = 0
                    let i = 0
                    let sufficientUnspent = {
                        found: false,
                        tx_hash: "",
                        tx_output_n: ""
                    }
                    
                    for (let j = 0; j < unspent.length; j++) {
                        if (unspent[j].value > requiredBalance) {
                            sufficientUnspent.found       = true
                            sufficientUnspent.tx_hash     = unspent[j].tx_hash
                            sufficientUnspent.tx_output_n = unspent[j].tx_output_n
                            // setting up that var to send back change
                            unspent_amount = unspent[j].value
                            // ending loop
                            j = unspent.length
                        }
                    }

                    if (sufficientUnspent.found) {
                        tx.addInput(sufficientUnspent.tx_hash, sufficientUnspent.tx_output_n)
                    }
                    else {
                        while (requiredBalance > unspent_amount || i != unspent.length) {
                            unspent_amount += unspent[i].value
                            tx.addInput(unspent[i].tx_hash, unspent[i].tx_output_n)
                            i++
                        }

                        if (i == unspent.length && unspent_amount < requiredBalance) {
                            throw "No free outputs to spend"
                        }
                    }

                    const change_nogas = unspent_amount - spending // 4000
                    const change       = change_nogas - gasPrice // 2800

                    // adding change to transaction to return unspent to sender
                    tx.addOutput(address, change)

                    if (i)
                        for (let j = 0; j < i; j++){
                            tx.sign(j, account)
                        }
                    else 
                        tx.sign(0, account)

                    const hexedTx = tx.build().toHex()
                    resolve(hexedTx)
                }

                if (unspent.length == 0)
                    throw "No free outputs to spend"
            }
            catch (e) {
                console.log(e)
                if (e == "No free outputs to spend")
                    reject("not_enought_fund")
                
                else 
                    reject("error_signing_transaction")
            }
        })
    }

    getGasPrice () {
        return new Promise(async (resolve, reject) => {        
            query.get_json(this.api.getGasPrice())
            .then(res => {
                resolve(res.halfHourFee * 225)
            })
            .catch(err => {
                console.log(err)
                resolve(12150)
            })
        })
    }
}