import Query     from '../../queryBuilder';
import MyEmitter from '../../myEmitter';
import Wrapper   from '../wrapper';
import config    from './modules/config';
import Explorer  from './modules/explorer';
import EthUtil   from './modules/util';
import Wallet    from './modules/wallet';
import Api       from './modules/api';
import Web3      from 'web3-eth'

var web3 = new Web3(config.provider)

const query = new Query()

export default class Ethereum extends Wrapper {
    constructor () {
        super({ name:"ETHEREUM", nativeCurrency:"ETH" })
        
        this.explorer = new Explorer()
        this.util = new EthUtil()
        this.wallet = new Wallet()
        this.api = new Api()

        this.gasLimit = "0x5208"

        this.getGasPrice()
    }

    getGasPrice () {
        const that = this
        return new Promise(async (resolve, reject) => {        
            query.get_json(this.api.getGasPrice())
            .then(res => {
                that.gasPrice = that.util.to0xFromNum(JSON.parse(res).safeLow * Math.pow(10, 9))
                resolve(true)
            })
            .catch(err => {
                console.log(err)
                that.gasPrice = "0x2540be400"
                resolve(true)
            })
        })
    }

    getBalance (address, precession) {
        const that = this
        return new Promise(async (resolve, reject) => {
            query.get_json(this.api.getBalance(address))
            .then(res => {
                const val = that.util.toHuman(Number(res.result))
                resolve(Number(val).toFixed(precession))
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
            query.get_json(this.api.getBalanceForMany(addresses))
            .then(res => {
                let list = []

                for (let i = 0; i < res.result.length; i++) {
                    const el = res.result[i]
                    list.push({
                        balance: (that.util.toHuman(Number(el.balance))).toFixed(precession),
                        address: el.address
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
        return new Promise(async(resolve, reject) => {
            query.get_json(this.api.getHistory(address))
            .then(res => {
                resolve(res.result)
            })
            .catch(e => {
                console.log(e)
                reject("error_getting_history")
            })
        })
    }

    payment (to, value) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve({
                    to: to,
                    value: this.util.computarizeToNative(value),
                    gasLimit: this.gasLimit,
                    gasPrice: this.gasPrice
                })
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
            const machGas = Number(this.gasLimit) * Number(this.gasPrice)
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
        const resolveOnce = async (receipt) => {
            if (!returned) {

                emitter.emitObject("confirmation", receipt)
                returned = true

                try { 
                    this.saveStats(receipt)
                } catch (e) {}
            }
        }

        const rejectOnce = async (error) => {
            if (!returned) {
                if (error.toString().indexOf("insufficient funds for gas * price + value") != -1)
                    emitter.emitObject("error", {data:"not_enought_fund"})
                
                else if (error.toString().indexOf(`invalid sender`))
                    emitter.emitObject("error", {data:'wrong_privatekey'})

                else
                    emitter.emitObject("error", {data:"error_submiting_transaction"})
            }
        }

        web3.eth.sendSignedTransaction("0x"+tx)
        .on('transactionHash', async (hash) => { 
            console.log('transaction sumited to network', hash)
        })
        .on('confirmation', async (confirmationNumber, receipt) => {
            resolveOnce(receipt)
        })
        .on('error', (e) => {
            rejectOnce(e)
        })

        return emitter
    }
}
