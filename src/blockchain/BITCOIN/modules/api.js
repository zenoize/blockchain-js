import config from './config';

export default class Api {
    constructor () {
        this.api = config.api
    }

    // https://blockchain.info/balance?active=3BMEXDmgn9adhbQnUxrmw8jorDW8ZPBJEm
    // https://api.blockcypher.com/v1/btc/test3/addrs/mqBs5MEc6sGCgSFdEcNtbE3RpsVUmo3TMf/balance
    /**
     * @param {string} address wallet address derived from public key to get balance for
     */
    getBalance (address) {
        if (config.network == "testnet")
            return `${this.api}/addrs/${address}/balance`

        else if (config.network == "bitcoin")
            return `${this.api}/balance?active=${address}`
    }

    // https://blockchain.info/balance?active=3BMEXDmgn9adhbQnUxrmw8jorDW8ZPBJEm|1PqCHQLtMzQNqewVMVNfttotg9EvaWzhKh
    getBalanceForMany (addresses) {
        const joined = addresses.join("|")
        return `${this.api}/balance?active=${joined}`
    }

    // https://bitcoinfees.earn.com/api/v1/fees/recommended
    getGasPrice () {
        return "https://bitcoinfees.earn.com/api/v1/fees/recommended"
    }

    // https://blockchain.info/rawaddr/3BMEXDmgn9adhbQnUxrmw8jorDW8ZPBJEm
    // https://api.blockcypher.com/v1/btc/test3/addrs/mqBs5MEc6sGCgSFdEcNtbE3RpsVUmo3TMf/full
    getHistory (address) {
        if (config.network == "testnet") 
            return `${this.api}/addrs/${address}/full`
        
        else if (config.network == "bitcoin")
            return `${this.api}/rawaddr/${address}`
    }

    // https://blockchain.info/unspent?active=3BMEXDmgn9adhbQnUxrmw8jorDW8ZPBJEm
    getUnspentOutputs (address) {
        if (config.network == "testnet")
            return `https://api.blockcypher.com/v1/btc/test3/addrs/${address}/full?limit=50?unspentOnly=true&includeScript=true`
            // return `https://chain.so/api/v2/get_tx_unspent/BTCTEST/${address}`
        
        else if (config.network == "bitcoin")
            return `https://api.blockcypher.com/v1/btc/main/addrs/${address}/full?limit=50?unspentOnly=true&includeScript=true`
    }
    
    // https://api.blockcypher.com/v1/bcy/test/txs/push
    // https://api.blockcypher.com/v1/btc/main/txs/push
    // https://api.blockcypher.com/v1/btc/test3/txs/eee3e9613464d8a53f6153bdcc9edf1b720fae0f6cb37fe923c7bbf1dd65c950?limit=50&includeHex=true
    postTx () {
        if (config.network == "testnet")
            return `https://api.blockcypher.com/v1/bcy/test/txs/push`
        
        else if (config.network == "bitcoin")
            return `https://api.blockcypher.com/v1/btc/main/txs/push`
    }

    getBlock (hash) {
        if (config.network == "testnet")
            return `https://api.blockcypher.com/v1/btc/test3/blocks/${hash}`

        else if (config.network == "bitcoin")
            return `https://api.blockcypher.com/v1/btc/main/blocks/${hash}`
    }

    getTransaction (hash) {
        if (config.network == "testnet") 
            return `https://api.blockcypher.com/v1/btc/test3/txs/${hash}`

        else if (config.network == "bitcoin")
            return `https://api.blockcypher.com/v1/btc/main/txs/${hash}`
    }
}