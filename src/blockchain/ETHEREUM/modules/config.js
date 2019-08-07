import env from '../../../../env';

export default (function () {
    if (env.CRYPTO_NETWORK == 'test') {
        return {
            api: "https://api-rinkeby.etherscan.io",
            explorer: "https://rinkeby.etherscan.io",
            network: "rinkeby",
            provider: "https://rinkeby.infura.io/v3/788e52e5a8d44e74a0863aca59cd27b1",
            apikey: env.ETHERSCAN_APIKEY
        }
    }

    if (env.CRYPTO_NETWORK == 'main') {
        return {
            api: "https://api.etherscan.io",
            explorer: "https://etherscan.io",
            network: "mainnet",
            provider: "https://mainnet.infura.io/v3/788e52e5a8d44e74a0863aca59cd27b1",
            apikey: env.ETHERSCAN_APIKEY
        }
    }
})()