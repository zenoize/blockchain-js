export default class MNUtil {
    constructor () {}

    computarizeToNative (amount) {
        return amount * Math.pow(10, 18)
    }

    toHuman (amount) {
        return amount / Math.pow(10, 18)
    }

    to0xFromNum (num) {
        return "0x" + num.toString(16)
    }
}