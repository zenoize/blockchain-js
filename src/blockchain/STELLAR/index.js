import Query     from '../../queryBuilder';
import MyEmitter from '../../myEmitter';
import Explorer  from './modules/explorer';
import XLMUtil   from './modules/util';
import Wallet    from './modules/wallet';
import Api       from './modules/api';

import Wrapper from '../wrapper';

const query = new Query()

export default class Stellar extends Wrapper {
    constructor () {
        super ({ name:"STELLAR", nativeCurrency:"XLM" })

        this.explorer = new Explorer()
        this.util = new XLMUtil()
        this.wallet = new Wallet()
        this.api = new Api()

        this.getGasPrice()
    }

    getGasPrice () {
        return new Promise(async (resolve, reject) => {
            this.gasPrice = 0.00001
            resolve(0.00001)
        })
    }

    getBalance (address, precession) {
        const that = this
        return new Promise(async (resolve, reject) => {
            query.get_json(this.api.getBalance(address))
            .then(res => {
                const balances = res.balances
                let nativeBalance = ""
        
                for (let i = 0; i < balances.length; i++) {
                    if (balances[i].asset_type == "native")
                        nativeBalance = Number(balances[i].balance)
                }

                resolve(nativeBalance.toFixed(precession))
            })
            .catch(e => {
                console.log(e)
                reject("error_getting_balance")
            })
        })
    }    

    getBalanceForMany (addresses, precession) {
        const that = this
        return new Promise(async (resolve, reject) => {
            try {
                let list = []
                for (let i = 0; i < addresses.length; i++) {
                    list.push({
                        balance: await that.getBalance(addresses[i], precession),
                        address: addresses[i]
                    })
                }
    
                const res = await Promise.all(list)
    
                resolve(res)
            }
            catch (e) {
                console.log(e)
                reject(e)
            }
        })
    }

    getHistory (address) {
        return new Promise(async (resolve, reject) => {
            query.get_json(this.api.getHistory(address))
            .then(res => {
                const list = res._embedded.records
                
                resolve(list)
            })
            .catch(e => {
                console.log(e)
                reject("error_getting_history")
            })
        })
    }

    payment (to, value) {
        return new Promise(async (resolve, reject) => {
            resolve({
                to:to,
                value: (Math.floor(value * 100) / 100).toString()
            })
        })
    }

    getRequiredBalance (txValue) {
        return new Promise(async (resolve, reject) => {
            const humGas = this.gasPrice
            const machGas = this.util.computarizeToNative(humGas)
            
            const machVal = this.util.computarizeToNative(txValue)

            resolve({
                human: txValue + humGas,
                machine: machVal + machGas
            })
        })
    }

    submitSigned (signedTx) {
        const emitter = new MyEmitter()
        
        this.wallet.xlmServer.submitTransaction(signedTx)
        .then(receipt => {
            emitter.emitObject("confirmation", receipt)

            try {
                this.saveStats(receipt)
            }
            catch (e) {}
        })
        .catch(error => {
            console.log(error)

            emitter.emitObject("error", {data:"error_submiting_transaction"})
        })

        return emitter
    }
}
