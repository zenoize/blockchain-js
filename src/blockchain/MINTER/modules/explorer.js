import config from './config';

export default class Explorer {
    constructor () {
        this.explorer = config.explorer
        this.apikey = config.apikey
    }

    address (address) {
        return `${this.explorer}/address/${address}`
    }

    transaction (hash) {
        return `${this.explorer}/transactions/${hash}`
    }

    tokenProfile (address) {
        return `${this.explorer}/token/${address}`
    }

    validator (address) {
        return `${this.explorer}/validator/${address}`
    }
}
