#!/usr/bin/env node
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var fs = require('fs');
var path = require('path');
var cuid = require('cuid');
var _a = require('enquirer'), AutoComplete = _a.AutoComplete, Input = _a.Input, Select = _a.Select;
var glob = require('glob');
/**
 * @typedef {Object} GameObject
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string[]} tagIds
 * @property {Object} [key]
 */
/**
 * @typedef {Object} Tag
 * @property {string} id
 * @property {string} name
 * @property {string} description
 */
/**
 * @typedef {Object} OutputShape
 * @property {GameObject[]} gameObjects
 * @property {Tag[]} tags
 */
var outputShape = {
    gameObjects: [
        {
            id: '',
            name: '',
            description: '',
            tagIds: []
        }
    ],
    tags: [
        {
            id: '',
            name: '',
            description: ''
        }
    ]
};
// Function to get first level keys in JSON object
function getFirstLevelKeys(obj) {
    return Object.keys(obj);
}
// Function to get all unique keys in an array of objects
function getUniqueKeys(arr) {
    var keys = new Set();
    arr.forEach(function (obj) {
        Object.keys(obj).forEach(function (key) { return keys.add(key); });
    });
    return Array.from(keys);
}
// Function to get nested JSON by path
function getNestedJSON(input, path) {
    var pathParts = path.split('.');
    var current = input;
    for (var _i = 0, pathParts_1 = pathParts; _i < pathParts_1.length; _i++) {
        var part = pathParts_1[_i];
        if (current[part] === undefined) {
            throw new Error("Could not find ".concat(part, " in the JSON data."));
        }
        current = current[part];
    }
    return current;
}
/**
 * @param {any} input
 * @param {string} path
 * @param {Record<string, string | undefined>} mappings
 * @returns {OutputShape}
 */
function convertJSON(input, path, mappings) {
    var output = __assign({}, outputShape);
    // Extract the required nested structure from the input JSON
    var nestedInput = getNestedJSON(input, path);
    // Map the gameObjects based on user mappings
    if (Array.isArray(nestedInput)) {
        output.gameObjects = nestedInput.map(function (item) {
            var gameObject = __assign({}, outputShape.gameObjects[0]);
            gameObject.id = cuid();
            for (var key in mappings) {
                if (mappings.hasOwnProperty(key)) {
                    var inputKey = mappings[key];
                    if (inputKey !== undefined) {
                        var inputValue = item[inputKey];
                        if (key === 'tagIds') {
                            if (Array.isArray(inputValue)) {
                                gameObject[key] = inputValue;
                            }
                            else {
                                gameObject[key] = inputValue !== undefined ? inputValue : gameObject[key];
                            }
                        }
                        else {
                            gameObject[key] = inputValue !== undefined ? inputValue : gameObject[key];
                        }
                    }
                }
            }
            return gameObject;
        });
    }
    return output;
}
// Function to start the conversion process
function startConversion() {
    return __awaiter(this, void 0, void 0, function () {
        var inputPathPrompt, inputPath, inputData, inputJSON, keys, jsonPathPrompt, jsonPath, nestedInput, uniqueKeys, mappings, fields, _i, fields_1, field, fieldType, promptMessage, keyPrompt, key, convertedJSON, outputData, outputPathPrompt, outputPath, fullOutputPath, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    inputPathPrompt = new Input({
                        name: 'inputPath',
                        message: '📁 Enter the path of the input JSON file: ',
                    });
                    return [4 /*yield*/, inputPathPrompt.run()];
                case 1:
                    inputPath = _a.sent();
                    inputData = fs.readFileSync(inputPath, 'utf-8');
                    inputJSON = JSON.parse(inputData);
                    keys = getFirstLevelKeys(inputJSON);
                    jsonPathPrompt = new Select({
                        name: 'jsonPath',
                        message: '🔍 Select the path in JSON where the data to be converted is located: ',
                        choices: keys,
                    });
                    return [4 /*yield*/, jsonPathPrompt.run()];
                case 2:
                    jsonPath = _a.sent();
                    nestedInput = getNestedJSON(inputJSON, jsonPath);
                    uniqueKeys = getUniqueKeys(nestedInput);
                    mappings = {};
                    fields = Object.keys(outputShape.gameObjects[0]);
                    _i = 0, fields_1 = fields;
                    _a.label = 3;
                case 3:
                    if (!(_i < fields_1.length)) return [3 /*break*/, 6];
                    field = fields_1[_i];
                    fieldType = typeof outputShape.gameObjects[0][field];
                    promptMessage = "\u2B50\uFE0F Which key in your JSON corresponds to \"".concat(field, "\" with value type \"").concat(fieldType, "\"?") + '\n' + " \uD83D\uDC49 Enter \"none\" if none exists.";
                    keyPrompt = new Select({
                        name: 'key',
                        message: promptMessage,
                        choices: __spreadArray(__spreadArray([], uniqueKeys, true), ['none'], false),
                    });
                    return [4 /*yield*/, keyPrompt.run()];
                case 4:
                    key = _a.sent();
                    mappings[field] = key === 'none' ? undefined : key;
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    convertedJSON = convertJSON(inputJSON, jsonPath, mappings);
                    outputData = JSON.stringify(convertedJSON, null, 2);
                    outputPathPrompt = new Input({
                        name: 'outputPath',
                        message: '📁 Enter the path where you want to save the output JSON file (e.g., /your/path/name/): ',
                    });
                    return [4 /*yield*/, outputPathPrompt.run()];
                case 7:
                    outputPath = _a.sent();
                    fullOutputPath = path.join(outputPath, 'ready-for-upload.json');
                    // Write the output JSON file
                    fs.writeFileSync(fullOutputPath, outputData, 'utf-8');
                    console.log('✅ Output JSON file saved successfully! ✅');
                    // Exit the process
                    process.exit(0);
                    return [3 /*break*/, 9];
                case 8:
                    error_1 = _a.sent();
                    console.error('❌ An error occurred:', error_1);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
// Start the conversion process
startConversion();
