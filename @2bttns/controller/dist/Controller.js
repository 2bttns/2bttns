"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Controller {
    constructor(config) {
        const { secret, url } = config;
        console.log(`[2bttns] Initializing controller: ${secret} ${url}`);
    }
}
exports.default = Controller;
