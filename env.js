let localenv = undefined
try { localenv = require('./env.local') } catch (e) {console.log('env.local.js not found, using mainnet')}

if (typeof localenv != 'undefined') 
    module.exports = localenv

else {
    module.exports = {
        CRYPTO_NETWORK: "main",
        ETHERSCAN_APIKEY: "your_etherscan_apikey",
        DATA_SERVICE: "https://api.alobor.io/service/data",
        ETHEREUM_CHAINDATA_SERVICE: "https://api.alobor.io/service/ethereum/chaindata",
        STELLAR_CHAINDATA_SERVICE: "https://api.alobor.io/service/stellar/chaindata",
        MINTER_CHAINDATA_SERVICE: "https://api.alobor.io/service/minter/chaindata",
        ALOBORIO_STATS_ROUTE: "https://api.alobor.io/stats",
        MERCHANT_APIKEY: "your_aloborio_commerce_token"
    }
}