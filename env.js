const localenv = require('./env.local')

if (typeof localenv != 'undefined') 
    module.exports = localenv

else {
    module.exports = {
        CRYPTO_NETWORK: "main",
        ETHERSCAN_APIKEY: "your_etherscan_apikey",
        DATA_SERVICE: "https://api.blockpen.tech/service/data",
        ETHEREUM_CHAINDATA_SERVICE: "https://api.blockpen.tech/service/ethereum/chaindata",
        ETHEREUM_TRANSACTION_SERVICE: "https://api.blockpen.tech/service/ethereum/transaction",
        STELLAR_CHAINDATA_SERVICE: "https://api.blockpen.tech/service/stellar/chaindata",
        STELLAR_TRANSACTION_SERVICE: "https://api.blockpen.tech/service/stellar/transaction",
        MINTER_CHAINDATA_SERVICE: "https://api.blockpen.tech/service/minter/chaindata",
        MINTER_TRANSACTION_SERVICE: "https://api.blockpen.tech/service/minter/transaction",
        BITCOIN_CHAINDATA_SERVICE: "https://api.blockpen.tech/service/bitcoin/chaindata",
        BITCOIN_TRANSACTION_SERVICE: "https://api.blockpen.tech/service/bitcoin/transaction",
        BLOCKPEN_STATS_ROUTE: "https://api.blockpen.tech/stats",
        MERCHANT_APIKEY: "your_blockpen_commerce_token"
    }
}