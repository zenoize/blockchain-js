import env from '../../../../env';

export default (function () {
    if (env.CRYPTO_NETWORK == 'test') {
        return {
            api: "https://horizon-testnet.stellar.org",
            explorer: "http://testnet.stellarchain.io",
            network: "testnet",
            provider: "https://horizon-testnet.stellar.org",
            apikey: ""
        }
    }

    if (env.CRYPTO_NETWORK == 'main') {
        return {
            api: "https://horizon.stellar.org",
            explorer: "https://stellarchain.io",
            network: "mainnet",
            provider: "https://horizon.stellar.org",
            apikey: ""
        }
    }
})()