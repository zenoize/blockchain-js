import socket       from 'socket.io-client';
import env          from '../../env'
import MyEmitter    from '../myEmitter';
import QueryBuiledr from '../queryBuilder';

const query = new QueryBuiledr()

export default class Wrapper {

    /**
     * @param {object} props 
     * {
     *     name: "name of blockchain",
     *     nativeCurrency: "native currency of chain"
     * }
     */
    constructor (props) {
        Object.assign(this, props);
    }

    /**
     * @param {string} address account to subscribe to
     */
    subscribeToBalance (address) {
        const io = socket.connect(env[`${this.name}_CHAINDATA_SERVICE`])
        const emitter = new MyEmitter();
        const data = {
            blockchain: this.name,
            currency: this.nativeCurrency,
            to: address
        }

        io.emit(`listen_balance_changed`, data)

        io.on(`${this.name.toLowerCase()}_balance_changed`, async (msg) => {
            console.log(msg)
            emitter.emitObject("update", msg)
        })

        return emitter
    }
    
    /**
     * 
     * @param {string} x currency ticker to check if it is native
     */
    isNativeCurrency (x) {
        return x == this.nativeCurrency
    }

    /**
     * @param {string} signedtx transaction signed with a private key
     */
    saveStats (receipt) {
        try {
            const data = {
                type: "payment",
                isNative: true,
                order: "of_app_or_sdk",
                tx: receipt
            }
            query.post_json(`${env.ALOBORIO_AQR_ROUTE}/setConfirmedOrder`, data)
        }
        catch (e) {
            console.log(e)
        }
    }
}