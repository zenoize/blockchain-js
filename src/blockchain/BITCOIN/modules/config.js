import env from '../../../../env';

export default (function () {
    if (env.CRYPTO_NETWORK == 'test') {
        return {
            api: "https://api.blockcypher.com/v1/btc/test3",
            explorer: "https://live.blockcypher.com/btc-testnet",
            network: "testnet",
            provider: "",
            apikey: ""
        }
    }

    if (env.CRYPTO_NETWORK == 'main') {
        return {
            api: "https://blockchain.info",
            explorer: "https://www.blockchain.com/btc",
            network: "bitcoin",
            provider: "",
            apikey: ""
        }
    }
})()