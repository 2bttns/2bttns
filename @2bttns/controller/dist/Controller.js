"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openapi_typescript_fetch_1 = require("openapi-typescript-fetch");
class Controller {
    constructor(config) {
        const { secret, url } = config;
        this.api = openapi_typescript_fetch_1.Fetcher.for();
        this.api.configure({
            baseUrl: url,
        });
        console.info(`[2bttns] Controller initialized ${secret} ${url}`);
    }
}
exports.default = Controller;
