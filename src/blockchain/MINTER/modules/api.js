import config from './config';

export default class Api {
    constructor () {
        this.api = config.api
    }

    getBalance (address) {
        return `${this.api}/addresses/${address}`
    }

    getTransaction (hash) {
        return `${this.api}/transactions/${hash}`
    }
    
    postTransaction (signedHex) {
        return `${this.api}/send_transaction?tx=0x${signedHex}`
    }

    getHistory (address) {
        return `${this.api}/addresses/${address}/transactions`
    }

    delegations (address) {
        return `${this.api}/addresses/${address}/delegations`
    }
}