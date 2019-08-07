import axios from 'axios';

export default class QueryBuilder {
    constructor () {
        this.getJson = {
            method : 'get',
            headers: {
                "Content-Type": "application/json"
            },
            url: ""
        }

        this.postJson = {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            url: ""
        }
    }

    get_json (url) {
        const that = this
        return new Promise(async (resolve, reject) => {
            let obj = that.getJson
            obj.url = url
            axios(obj)
            .then(response => {
                resolve(response.data)
            })
            .catch(err => {
                reject(err.response.data)
            })
        })
    }

    post_json (url, data) {
        const that = this
        return new Promise(async (resolve, reject) => {
            let obj = that.postJson
            obj.body = data
            obj.url = url
            axios(obj)
            .then(response => {
                resolve(response.data)
            })
            .catch(err => {
                reject(err.response.data)
            })
        })
    }
}