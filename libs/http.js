import fetch from "node-fetch"

export class HTTPUtils {
    static tlsHttpGet(url, headers = null, options = null, status = 200) {
        return new Promise(function(resolve, reject) {
            fetch("http://127.0.0.1:8082", {
                headers:{
                    "poptls-url":url,
                    ...headers
                },
                "method": "GET",
                ...options
            }).then(async (res) => {
                if(res.status != status) {
                    reject({message:"Status not " + status + " (Got " + res.status + ")"});
                }
                else {
                    let text = await res.text();
                    let json;
                    try {
                        json = JSON.parse(text);
                    }
                    catch(e) {}
                    resolve({text:text, json:json, res:res});
                }
            }).catch((e) => {
                reject({message:e.message});
            });
        });
    }
    
    static tlsHttpPost(url, data, headers = null, options = null, status = 200) {
        return new Promise(function(resolve, reject) {
            fetch("http://127.0.0.1:8082", {
                headers:{
                    "poptls-url":url,
                    ...headers
                },
                "method": "POST",
                "body":data,
                ...options
            }).then(async (res) => {
                if(res.status != status) {
                    reject({message:"Status not " + status + " (Got " + res.status + ")"});
                }
                else {
                    let body = await res.text();
                    resolve({body:body, res:res});
                }
            }).catch((e) => {
                reject({message:e.message});
            });
        });
    }
}

export function tlsHttpGet(url, headers = null, options = null, status = 200) {
    return new Promise(function(resolve, reject) {
        fetch("http://127.0.0.1:8082", {
            headers:{
                "poptls-url":url,
                "poptls-proxy":"http://127.0.0.1:8888",
                ...headers
            },
            "method": "GET",
            ...options
        }).then(async (res) => {
            if(res.status != status) {
                reject({message:"Status not " + status + " (Got " + res.status + ")"});
            }
            else {
                let text = await res.text();
                let json;
                try {
                    json = JSON.parse(text);
                }
                catch(e) {}
                resolve({text:text, json:json, res:res});
            }
        }).catch((e) => {
            reject({message:e.message});
        });
    });
}

export function tlsHttpPost(url, data, headers = null, options = null, status = 200) {
    return new Promise(function(resolve, reject) {
        fetch("http://127.0.0.1:8082", {
            headers:{
                "poptls-url":url,
                "poptls-proxy":"http://127.0.0.1:8888",
                ...headers
            },
            "method": "POST",
            "body":data,
            ...options
        }).then(async (res) => {
            if(res.status != status) {
                reject({message:"Status not " + status + " (Got " + res.status + ")"});
            }
            else {
                let body = await res.text();
                resolve({body:body, res:res});
            }
        }).catch((e) => {
            reject({message:e.message});
        });
    });
}