import config from './config';

export default class Api {
    constructor () {
        this.apikey = config.apikey
        this.api = config.api
    }

    getBalance (address) {
        return `${this.api}/api?module=account&action=balance&address=${address}&tag=latest&apikey=${this.apikey}`
    }

    getBalanceForMany (addresses) {
        const joined = addresses.join("")
        return `${this.api}/api?module=account&action=balancemulti&address=${joined}&tag=latest&apikey=${this.apikey}`
    }

    tokenBalances (address, tokenAddress) {
        return `${this.api}/api?module=account&action=tokenbalance&contractaddress=${tokenAddress}&address=${address}&tag=latest&apikey=${this.apikey}`
    }

    abi (address) {
        return `${this.api}/api?module=contract&action=getabi&address=${address}&apikey=${this.apikey}`;
    }

    getGasPrice () {
        return "https://ethgasstation.info/json/ethgasAPI.json"
    }

    getHistory (address) {
        return `${this.api}/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${this.apikey}`
    }
}