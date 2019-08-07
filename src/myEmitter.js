import { EventEmitter } from "events";

export default class MyEmitter extends EventEmitter {
    emitObject(event, obj = {}) {
        this.emit(event, obj)
        return obj;
    }
}