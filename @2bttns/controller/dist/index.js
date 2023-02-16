"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __importDefault(require("./Controller"));
const greeting_1 = __importDefault(require("./greeting"));
const sayHelloWorld_1 = __importDefault(require("./sayHelloWorld"));
exports.default = {
    Controller: Controller_1.default,
    greeting: greeting_1.default,
    sayHelloWorld: sayHelloWorld_1.default,
};
