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
        this.decimals = 7

        this.getGasPrice()
    }

    getGasPrice () {
        return new Promise(async (resolve, reject) => {
            this.gasPrice = 0.00001
            this.humanFeeRate = 0.00001
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
                console.log(e, "error_getting_balance")
                resolve(0)
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
                const formatedList = []

                if (res._embedded.records.length == 1) {
                    const data = res._embedded.records[0]
                    
                    formatedList.push({
                        hash: data.transaction_hash,
                        type: "Account activation",
                        from: data.funder,
                        timestamp: new Date(data.created_at.replace("Z", "")).toUTCString(),
                        data: {
                            value: data.starting_balance,
                            to: data.account,
                            coin: "XLM"
                        },
                        explorer: this.explorer.transaction(data.transaction_hash)
                    })
                        
                }
                else {
                    if (res._embedded.records.length <= 10) {
                        const activation = res._embedded.records[res._embedded.records.length-1]
                        const list = res._embedded.records.splice(0, res._embedded.records.length-1)

                        for (let i = 0; i < list.length; i++) {
                            if (list[i].type == "payment")
                                formatedList.push({
                                    hash: list[i].transaction_hash,
                                    type: "Transfer",
                                    from: list[i].from,
                                    timestamp: new Date(list[i].created_at.replace("Z", "")).toUTCString(),
                                    data: {
                                        value: list[i].amount,
                                        to: list[i].to,
                                        coin: (list[i].asset_type != "native") ? list[i].asset_code : "XLM"
                                    },
                                    explorer: this.explorer.transaction(list[i].transaction_hash)
                                })
                            if (list[i].type == "create_account") {
                                formatedList.push({
                                    hash: list[i].transaction_hash,
                                    type: "Activate external account",
                                    from: list[i].source_account,
                                    timestamp: new Date(list[i].created_at.replace("Z", "")).toUTCString(),
                                    data: {
                                        value: list[i].starting_balance,
                                        to: list[i].account,
                                        coin: "XLM"
                                    },
                                    explorer: this.explorer.transaction(list[i].transaction_hash)
                                })
                            }
                        }

                        formatedList.push({
                            hash: activation.transaction_hash,
                            type: "Account activation",
                            from: activation.funder,
                            timestamp: new Date(activation.created_at.replace("Z", "")).toUTCString(),
                            data: {
                                value: activation.starting_balance,
                                to: activation.account,
                                coin: "XLM"
                            },
                            explorer: this.explorer.transaction(activation.transaction_hash)
                        })
                    }
                    else {
                        const list = res._embedded.records.splice(0, 10)
        
                        for (let i =0; i < list.length; i++) {
                            if (list[i].type == "payment")
                                formatedList.push({
                                    hash: list[i].transaction_hash,
                                    type: "Transfer",
                                    from: list[i].from,
                                    timestamp: new Date(list[i].created_at.replace("Z", "")).toUTCString(),
                                    data: {
                                        value: list[i].amount,
                                        to: list[i].to,
                                        coin: (list[i].asset_type != "native") ? list[i].asset_code : "XLM"
                                    },
                                    explorer: this.explorer.transaction(list[i].transaction_hash)
                                })
                        }
                    }
                }
                resolve(formatedList)
            })
            .catch(e => {
                console.log(e)
                resolve(Array())
            })
        })
    }

    payment (to, value) {
        return new Promise(async (resolve, reject) => {
            resolve({
                to: to,
                value: (Math.floor(value * 100) / 100).toString(),
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
        .catch((error, data) => {
            console.log(error, data)
            // if (error.extras.result_codes.operations[0] == "op_no_destination")
            //     emitter.emitObject("error", {data:"recipient_address_not_exist"})

            emitter.emitObject("error", {data:"error_submiting_transaction"})
        })

        return emitter
    }
}
