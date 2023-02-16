"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sayHelloWorld = exports.greeting = void 0;
var greeting_1 = require("./greeting");
Object.defineProperty(exports, "greeting", { enumerable: true, get: function () { return __importDefault(greeting_1).default; } });
var sayHelloWorld_1 = require("./sayHelloWorld");
Object.defineProperty(exports, "sayHelloWorld", { enumerable: true, get: function () { return __importDefault(sayHelloWorld_1).default; } });
