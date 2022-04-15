import { LogEmitter } from "../libs/log.js";
import { ModuleBase } from "./module_base.js";

export default class CMV2Mint extends ModuleBase {

    constructor(data) {
        super();
        try {
            this.CMID = data.cmid;
            this.RPC = data.rpc;
            this.PRIVATE_KEY = data.private_key;
            this.VALID_DATA = true;
        }
        catch(e) {
            LogEmitter.log(this, e.message);
            this.VALID_DATA = false;
        }
    }

    async startQuickTask(){
        if (this.isRunning()) {
          if (this.VALID_DATA) {
              try{
                LogEmitter.log(this, "Task loaded.")
              } catch {
                LogEmitter.log (this, "Error, couldnt load task.")
              }
          }
        }
    }

    isRunning() {
        if (this.RUNNING) {
            return true;
        }
        else {
            this.reportDestroyed();
        }
    }
}