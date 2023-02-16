"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Controller {
    constructor(config) {
        const { secret } = config;
        console.log(`Initializing controller with secret: ${secret}`);
    }
}
exports.default = Controller;
