"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const openapi_typescript_fetch_1 = require("openapi-typescript-fetch");
class Controller {
    constructor(config) {
        const { appId, secret, url } = config;
        this.appId = appId;
        this.secret = secret;
        this.url = url;
        this.api = openapi_typescript_fetch_1.Fetcher.for();
        this.api.configure({
            baseUrl: `${url}/api`,
        });
        console.info(`[2bttns] Controller initialized ${secret} ${url}`);
    }
    generateUserToken({ userId }) {
        const token = jsonwebtoken_1.default.sign({ userId }, this.secret, {
            expiresIn: "1h",
        });
        return token;
    }
    decodeUserToken({ token }) {
        const decoded = jsonwebtoken_1.default.verify(token, this.secret);
        const decodedObj = decoded;
        if (!decodedObj.userId) {
            throw new Error("Invalid token: no userId");
        }
        return decodedObj;
    }
    generatePlayUrl({ gameId, userId }) {
        const token = this.generateUserToken({ userId });
        const queryBuilder = new URLSearchParams();
        queryBuilder.append("game_id", gameId);
        queryBuilder.append("app_id", this.appId);
        queryBuilder.append("jwt", token);
        return `${this.url}/play?${queryBuilder.toString()}`;
    }
}
exports.default = Controller;
