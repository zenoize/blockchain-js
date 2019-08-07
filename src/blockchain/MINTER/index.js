import MinterTx         from 'minterjs-tx';
import MinterTxDataSend from 'minterjs-tx/src/tx-data/send';
import {TX_TYPE_SEND}   from 'minterjs-tx/src/tx-types';
import {formatCoin}     from 'minterjs-tx/src/helpers';
import MinterApi        from "minter-js-sdk/src/api";
import PostSignedTx     from 'minter-js-sdk/src/api/post-signed-tx';

import { delay}  from '../../utils/util'
import Query     from '../../queryBuilder';
import MyEmitter from '../../myEmitter';
import Wrapper   from '../wrapper'
import config    from './modules/config'
import Explorer  from './modules/explorer';
import Wallet    from './modules/wallet';
import Api       from './modules/api';
import MNUtil    from './modules/util';

const query = new Query()

const minterApi = new MinterApi(
    (config.network == "testnet")
        ? { apiType: 'node', baseURL: config.provider, chainId: config.chainId }
        : { apiType: 'gate', baseURL: config.gate, chainId: config.chainId }
)

export default class Minter extends Wrapper {
    constructor () {
        super({ name:"MINTER", nativeCurrency:"BIP" })
        
        this.explorer = new Explorer()
        this.util     = new MNUtil()
        this.wallet   = new Wallet()
        this.api      = new Api()

        this.getGasPrice()
    }

    getGasPrice () {
        const that = this
        return new Promise(async (resolve, reject) => {        
            that.gasPrice = "0x01"
            that.humanFeeRate = "0.01"
            resolve(true)
        })
    }

    // CURRENTLY RETURN ONLY BIP BALANCE
    getBalance (address, precession) {
        const that = this
        return new Promise(async (resolve, reject) => {
            query.get_json(this.api.getBalance(address))
            .then(res => {
                const balances = res.data.balances
                let bip_balance = 0

                for (let i = 0; i < balances.length; i++) {
                    balances[i].amount = Number(balances[i].amount).toFixed(precession)
                    if (config.network == "testnet") {
                        if (balances[i].coin == "MNT")
                            bip_balance = Number(balances[i].amount).toFixed(precession)
                    }
                    else if (config.network == "mainnet") {
                        if (balances[i].coin == "BIP")
                            bip_balance = Number(balances[i].amount).toFixed(precession)
                    }
                }
                
                // resolve(balances)
                resolve(bip_balance)
            })
            .catch(e => {
                console.log(e, "error_getting_balance")
                resolve(0)
            })            
        })
    }

    getBalanceForMany (addresses, precession) {
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
                reject("error_getting_balance")
            }
        })
    }

    getHistory (address) {
        return new Promise(async(resolve, reject) => {
            query.get_json(this.api.getHistory(address))
            .then(res => {
                let new_list = res.data.splice(0, 10)
                let formatedList = []

                for (let i = 0; i < new_list.length; i++) {
                    if (typeof new_list[i].data.list != "undefined" && new_list[i].data.list.length != 1) {
                        let obj = new_list[i].data.list
                        for (let j =0; j < obj.length; j++) {
                            if (obj[j].to == address) {
                                new_list[i].data = obj[j]
                            }
                        }
                    }
                }

                for (let i = 0; i < new_list.length; i++) {
                    formatedList.push({
                        hash: new_list[i].hash,
                        timestamp: new Date(new_list[i].timestamp.replace("Z", "")).toUTCString(),
                        from: new_list[i].from,
                        type: this.defineType(new_list[i].type),
                        data: new_list[i].data,
                        explorer: this.explorer.transaction(new_list[i].hash)
                    })
                }

                resolve(formatedList)
            })
            .catch(e => {
                console.log(e)
                resolve(Array())
            })
        })
    }

    defineType (inp) {
        switch (inp) {
            case 1: return "Transfer";
            case 2: return "Sell";
            case 3: return "Sell all";
            case 4: return "Buy";
            case 5: return "Create coin";
            case 6: return "Declary candidacy";
            case 7: return "Delegate";
            case 8: return "Unbond";
            case 9: return "Redeem check";
            case 10: return "Set candidate online";
            case 11: return "Set candidate offline";
            case 12: return "Create multisig";
            case 13: return "Multisend";
            case 14: return "Edit candidate";
        }
    }

    payment (to, value) {
        return new Promise(async (resolve, reject) => {
            try {
                const coin = (config.network == "testnet") ? formatCoin('MNT') : formatCoin('BIP')

                const txData = new MinterTxDataSend({
                    to: to.replace("Mx", "0x"),
                    coin: coin,
                    value: this.util.to0xFromNum(this.util.computarizeToNative(value)),
                });

                const tx = new MinterTx({
                    nonce: "0x01",
                    chainId: "0x" + config.chainId.toString(16),
                    gasPrice: '0x01',
                    gasCoin: coin, 
                    type: TX_TYPE_SEND,
                    data: txData.serialize(),
                    signatureType: '0x01'
                });
        
                resolve(tx)
            } catch (e) {
                console.log(e)
                reject("error_creating_payment")
            }
        })
    }

    getRequiredBalance (txValue) {
        return new Promise(async (resolve, reject) => {
            const humGas = 0.01
            const machGas = this.util.computarizeToNative(humGas)
            
            const machVal = this.util.computarizeToNative(txValue)

            resolve({
                human: txValue + humGas,
                machine: machVal + machGas
            })
        })
    }

    submitSigned (tx) {
        const emitter = new MyEmitter()
        const postSignedTx = new PostSignedTx(minterApi);
        let txHash = ""

        postSignedTx(tx)
        .then(response => {
            txHash = response
            return
        })
        .then(delay(5000))
        .then(() => {
            return query.get_json(this.api.getTransaction(txHash))
        })
        .then(receipt => {
            emitter.emitObject("confirmation", receipt.data)

            try {
                this.saveStats(receipt.data)
            }
            catch (e) {}
        })
        .catch(error => {
            console.log(error)
            if (error.response.data.error.tx_result.log.indexOf("Insufficient funds for sender account:") != -1)
                emitter.emitObject("error", {data:"not_enought_fund"})
            
            else 
                emitter.emitObject("error", {data:"error_submiting_transaction"})
        })

        return emitter
    }
}
