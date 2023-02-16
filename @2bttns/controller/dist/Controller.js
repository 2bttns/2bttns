"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const openapi_typescript_fetch_1 = require("openapi-typescript-fetch");
class Controller {
    constructor(config) {
        const { secret, url } = config;
        this.url = url;
        this.api = openapi_typescript_fetch_1.Fetcher.for();
        this.api.configure({
            baseUrl: `${url}/api`,
        });
        console.info(`[2bttns] Controller initialized ${secret} ${url}`);
    }
    playGame({ gameId, userId }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof window === "undefined") {
                throw new Error("Cannot play game on server");
            }
            window.location.href = `${this.url}/play/${gameId}/${userId}`;
        });
    }
}
exports.default = Controller;
