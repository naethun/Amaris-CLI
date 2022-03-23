import EventEmitter from "events";

export class CustomEventEmitter {
    static emit(name, value) {
        global.eventEmitter.emit(name, value);
    }

    static init() {
        global.eventEmitter = new EventEmitter();
    }

    static on(name, callback) {
        global.eventEmitter.on(name, callback);
    }
}