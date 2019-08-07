export default class Util  {
    constructor () {

    }

    computarizeToNative (amount) {
        return amount * Math.pow(10, 8)
    }

    toHuman (amount) {
        return amount / Math.pow(10, 8)
    }

    to0xFromNum (num) {
        return "0x" + num.toString(16)
    }

    parseTestnetForUnspent (obj) {
        const txs = obj.txs
        let response = []

        for (let i=0; i<txs.length; i++) {
            response.push({
                tx_hash: txs[i].hash
            })
        }
    }
}
