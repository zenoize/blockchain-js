import Query     from '../../queryBuilder';
import MyEmitter from '../../myEmitter';
import Wrapper   from '../wrapper';
import config    from './modules/config'
import Explorer  from './modules/explorer';
import BTCutil   from './modules/util';
import Wallet    from './modules/wallet';
import Api       from './modules/api';
import TxDecoder from './modules/decoder';
import bitcoin   from 'bitcoinjs-lib';
import { ENGINE_METHOD_CIPHERS } from 'constants';

const btc_network = bitcoin.networks[config.network]

const query = new Query()

export default class Bitcoin extends Wrapper {
    constructor () {
        super({ name:"BITCOIN", nativeCurrency:"BTC" })
        
        this.explorer = new Explorer()
        this.util = new BTCutil()
        this.api = new Api()
        
        this.getGasPrice()
        .then(() => {
            this.wallet = new Wallet(this.gasPrice)
        })

    }

    getGasPrice () {
        return new Promise(async (resolve, reject) => {
            query.get_json(this.api.getGasPrice())
            .then(res => {
                this.gasPrice = res.halfHourFee * 225
                resolve(true)
            })
            .catch(err => {
                console.log(err)
                this.gasPrice = 12150
                resolve(true)
            })
        })
    }

    getBalance (address, precession) {
        return new Promise(async (resolve, reject) => {
            query.get_json(this.api.getBalance(address))
            .then(res => {
                let val     = ""
                let hum_val = ""

                if (config.network == "testnet") 
                    val = res.final_balance
                
                else if (config.network == "bitcoin") 
                    val = res[address].final_balance
                
                hum_val = (this.util.toHuman(val)).toFixed(precession)

                resolve(hum_val)
            })
            .catch(e => {
                console.log(e)
                reject("error_getting_balance")
            })
        })
    }

    getBalanceForMany (addresses, precession) {
        return new Promise(async (resolve, reject) => {
            if (config.network == "testnet") {
                let list = []

                for (let i=0; i < addresses.length; i++) {
                    list.push({
                        balance: await this.getBalance(addresses[i]),
                        address: addresses[i]
                    })    
                }
            }
            else if (config.network == "bitcoin") 
                query.get_json(this.api.getBalanceForMany(addresses))
                .then(res => {
                    let list = []
                    
                    for (let wallet in res) {
                        const val = res[wallet].final_balance
                        const hum_val = (this.util.toHuman(val)).toFixed(precession)
                        list.push({
                            balance: hum_val,
                            address: wallet
                        })
                    }

                    resolve(list)
                })
                .catch(e => {
                    console.log(e)
                    reject("error_getting_balance")
                })
        })
    }

    getHistory (address) {
        return new Promise(async (resolve, reject) => {
            query.get_json(this.api.getHistory(address))
            .then(res => {
                resolve(res.txs)
            })
            .catch(err => {
                console.log(err)
                reject("error_getting_history")
            })
        })
    }

    payment (to, value) {
        return new Promise(async (resolve, reject) => {
            try {
                const tx = new bitcoin.TransactionBuilder(btc_network)
                tx.setVersion(1)
                tx.addOutput(to, this.util.computarizeToNative(value))
    
                resolve(tx)
            }
            catch (e) {
                console.log(e)
                reject("error_creating_payment")
            }
        })
    }

    getRequiredBalance (txValue) {
        return new Promise(async (resolve, reject) => {
            await this.getGasPrice()
            const machGas = Number(this.gasPrice)
            const humGas = this.util.toHuman(machGas)
            
            const machVal = this.util.computarizeToNative(txValue)

            resolve({
                human: txValue + humGas,
                machine: machVal + machGas
            })
        })
    }

    submitSigned (tx) {
        const emitter = new MyEmitter()
        const decodedTx = new TxDecoder(tx)
        const txid = decodedTx.format.txid

        query.post_json(this.api.postTx(), {tx:tx})
        .then(res => {
            emitter.emitObject("hash", {data:res})

            let interval = setInterval(() => {
                query.get_json(this.api.getTransaction(txid))
                .then(res => {
                    clearInterval(interval)
                    emitter.emitObject("confirmation", res)
                    try {
                        this.saveStats(res)
                    } catch (e) {}
                })
                .catch(e => {
                    const errMessage = JSON.parse(e).error
                    if (errMessage == `Transaction ${txid} not found.`)
                        console.log('[Bitcoin] Waiting for submition')
    
                    else {
                        clearInterval(interval)
                        emitter.emitObject("error", JSON.parse(e))
                    }
                })
            }, 300000)            
        })
        .catch(err => {
            emitter.emitObject("error", err)
        })

        return emitter
    }
}
