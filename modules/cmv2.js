import { LogEmitter } from "../libs/log.js";
import { ModuleBase } from "./module_base.js";
import XMLHttpRequest from "xhr2"

export default class CMV2Mint extends ModuleBase {
    constructor(data) {
        super();
        try {
            this.PRIVATE_KEY = data.private_key;
            this.URL = data.url;
            this.CMID = data.cmid;
        }
        catch(e) {
            LogEmitter.log(this, e.message);
            this.VALID_DATA = false;
        }
    }

    async startQuickTask(){
        var url = "https://mint.creatormachine.com/candyMachineStats";
        var xhr = new XMLHttpRequest();
        
        if (this.isRunning()) {
            try{
                xhr.open("POST", url);
                
                xhr.setRequestHeader("Content-Type", "application/json");
                
                xhr.onreadystatechange = function () {
                   if (xhr.readyState === 4) {
                    LogEmitter.log(xhr.status);
                    LogEmitter.log(xhr.responseText);
                   }};
                
                var data = `{"prv":"this.PRIVATE_KEY",
                            "id": "this.CMID"
                            };`
                
                xhr.send(data);
            } catch {
                LogEmitter.log("Mint failed");
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