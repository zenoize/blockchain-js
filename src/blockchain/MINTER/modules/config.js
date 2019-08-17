import env from '../../../../env';

export default (function () {
    if (env.CRYPTO_NETWORK == 'test') {
        return {
            api: "https://explorer-api.testnet.minter.network/api/v1",
            explorer: "https://testnet.explorer.minter.network",
            network: "testnet",
            provider: "https://minter-node-1.testnet.minter.network",
            apikey: "",
            gate: "",
            chainId: 2
        }
    }

    if (env.CRYPTO_NETWORK == 'main') {
        return {
            api: "https://explorer-api.minter.network/api/v1",
            explorer: "https://minterscan.net",
            network: "mainnet",
            provider: "https://explorer-api.minter.network/api/v1",
            apikey: "",
            gate: "https://gate-api.minter.network",
            chainId: 1
        }
    }
})()