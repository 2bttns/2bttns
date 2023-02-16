"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const greeting_1 = __importDefault(require("./greeting"));
function sayHelloWorld() {
    console.log((0, greeting_1.default)("World"));
}
exports.default = sayHelloWorld;
