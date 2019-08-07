
import socket from 'socket.io-client';
import Ethereum from './ETHEREUM';
import Stellar from './STELLAR';
import Minter from './MINTER';

import { DATA_SERVICE } from '../../env';

export default class Blockchain {
    constructor () {
        this.supported = ""
        
        this.ETHEREUM = new Ethereum()
        this.STELLAR = new Stellar()
        this.MINTER = new Minter()

        this.getSupportedCurrencies()
    }

    getSupportedCurrencies () {
        const io = socket.connect(DATA_SERVICE)

        io.on('ethereum_support_tokens_update', async (msg) => {
            console.log(msg)
            this.supported = msg.data
        })
    }

    parseHashFromReceipt (blockchain, receipt) {
        var parseAsEthereum = function (receipt) {
            var result = {}

            result.hash = receipt.transactionHash
            
            return result
        }

        var parseAsStellar = function (receipt) {
            var result = {}
            
            result.hash = receipt.hash

            return result
        }

        var parseAsMinter = function (receipt) {
            var result = {
                hash: receipt.hash
            }

            return result
        }

        switch (blockchain) {
            case "ETHEREUM":
                return parseAsEthereum(receipt)
                break
            case "STELLAR":
                return parseAsStellar(receipt)
                break
            case "MINTER":
                return parseAsMinter(receipt)
        }
    }
}