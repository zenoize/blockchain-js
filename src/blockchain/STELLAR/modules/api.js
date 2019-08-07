import config from './config';

export default class Api {
    constructor () {
        this.apikey = config.apikey
        this.api = config.api
    }

    getBalance (address) {
        return `${this.api}/accounts/${address}`
    }

    getHistory (address) {
        return `${this.api}/accounts/${address}/operations?order=desc`
    }
}