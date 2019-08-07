export default class Util  {
    constructor () {

    }

    computarizeToNative (amount) {
        return amount * Math.pow(10, 18)
    }

    toHuman (amount) {
        return amount / Math.pow(10, 18)
    }

    toHumanWithDecimals (amount, decimals) {
        return amount / Math.pow(10, decimals)
    }

    to0xFromNum (num) {
        return "0x" + num.toString(16)
    }
}