"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ws_1 = tslib_1.__importDefault(require("ws"));
var Methods;
(function (Methods) {
    Methods[Methods["Authorize"] = 0] = "Authorize";
})(Methods || (Methods = {}));
function websocketClient(address) {
    const ws = new ws_1.default(address);
    const events = new Map();
    const responsePromises = new Map();
    let responseIndex = 1;
    const reply = (p) => {
        return new Promise((resolve, reject) => {
            responsePromises.set(responseIndex, [resolve, reject]);
            ws.send(JSON.stringify({
                i: 1,
                m: 0,
                p: p
            }));
            responseIndex++;
            setTimeout(() => {
                reject();
            }, 5000);
        });
    };
    ws.on('open', () => {
        if (events.has('open'))
            events.get('open')({
                authorize: (p) => reply(p)
            });
    });
    ws.on('message', data => {
        if (typeof data !== "string")
            return;
        const message = JSON.parse(data);
        if ("r" in message && responsePromises.has(message.i)) {
            responsePromises.get(message.i)[0]();
        }
        else if ("e" in message) {
            responsePromises.get(message.i)[1]();
        }
    });
    return {
        on(event, callback) {
            events.set(event, callback);
        }
    };
}
exports.default = websocketClient;
