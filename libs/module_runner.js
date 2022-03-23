import { CustomEventEmitter as EventEmitter } from "./events.js";
import { LogEmitter } from "./log.js";

export class ModuleRunner {
    static init() {
        global.loadedModules = [];

        EventEmitter.init();
        
        EventEmitter.on("log", function() {
            LogEmitter.printAllLogs(global.loadedModules);
        });

        EventEmitter.on("module_destroy", function(instance_id) {
            for (let i = global.loadedModules.length-1; i >= 0; i--) {
                if (global.loadedModules[i].INSTANCE_ID == instance_id) {
                    global.loadedModules.splice(i, 1);
                    if (global.loadedModules.length == 0) {
                        console.clear();
                        EventEmitter.emit("task_stopped");
                    }
                }
            }
        });
    }

    static async instantiate(type, data) {
        let loadedModule = await import("../modules/" + type);
        loadedModule = new loadedModule.default(data);
        global.loadedModules.push(loadedModule);
        return loadedModule;
    }

    static destroyAll() {
        for (let i=0;i<global.loadedModules.length;i++) {
            global.loadedModules[i].destroy();
        }
    }
}