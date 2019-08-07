import config from './config';

export default class Explorer {
    constructor () {
        this.explorer = config.explorer
        this.apikey = config.apikey
    }

    // https://www.blockchain.com/btc/address/1PqCHQLtMzQNqewVMVNfttotg9EvaWzhKh
    // https://live.blockcypher.com/btc-testnet/address/2NDJnbyPLn99bnsTrnmnW3ABspkCNubo1JH
    address (address) {
        return `${this.explorer}/address/${address}`
    }

    // https://www.blockchain.com/btc/tx/962c238362ef41e104e107ab9ce2a08f327f2f282d44b6484ca054d0745c9637
    transaction (hash) {
        return `${this.explorer}/tx/${hash}`
    }
}
