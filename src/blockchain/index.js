import socket from 'socket.io-client';
import Ethereum from './ETHEREUM';
import Bitcoin from './BITCOIN';
import Stellar from './STELLAR';
import Minter from './MINTER';

import { DATA_SERVICE } from '../../env';

export default class Blockchain {
    constructor () {
        this.supported = ""
        
        this.ETHEREUM = new Ethereum()
        this.BITCOIN = new Bitcoin()
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
}