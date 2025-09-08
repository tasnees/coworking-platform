"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const { combine, timestamp, json, simple } = winston_1.default.format;
// Create a simple console logger
const logger = winston_1.default.createLogger({
    level: 'info',
    format: combine(timestamp(), json()),
    transports: [
        new winston_1.default.transports.Console({
            format: simple()
        })
    ]
});
exports.logger = logger;
