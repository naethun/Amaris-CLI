import { CustomEventEmitter as eventEmitter } from "./events.js";

export class LogEmitter {
    static logStr = "";
    static lineAmount = 0;

    static log(obj, str, override) {
        if (override || obj.isRunning()) {
            obj.logStatus = str;
            eventEmitter.emit("log");
        }
    }

    static printAllLogs(collection) {
        if (this.logStr != "") {
            process.stdout.moveCursor(0, (-this.logStr.split("\n").length)+1);
            process.stdout.cursorTo(0);
            process.stdout.clearScreenDown();
        }
        
        this.logStr = "";
        for (var i=0;i<collection.length;i++) {
            this.logStr += "Task " + (i+1) + ": " + collection[i].logStatus.replace(/\r/ig, "\n").trim() + "\n";
        }
        this.logStr = this.logStr.trim();

        process.stdout.write(this.logStr);
    }
}