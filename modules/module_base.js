import { LogEmitter } from "../libs/log.js";
import { CustomEventEmitter as EventEmitter } from "../libs/events.js";

export class ModuleBase {
    RUNNING = true;
    INSTANCE_ID = Math.random();

    destroy() {
        this.RUNNING = false;
        LogEmitter.log(this, "Task Stopping...", true);
    }

    reportDestroyed() {
        LogEmitter.log(this, "Task stopped", true);
        EventEmitter.emit("module_destroy", this.INSTANCE_ID);
        return false;
    }
}