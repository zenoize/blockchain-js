export default class Util  {
    constructor () {

    }

    computarizeToNative (amount) {
        return amount * Math.pow(10, 7)
    }

    toHuman (amount) {
        return amount
    }
}