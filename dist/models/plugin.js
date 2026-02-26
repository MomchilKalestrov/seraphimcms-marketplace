"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const PluginSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    version: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: String, required: true }
}, {
    minimize: false,
    versionKey: false
});
const Plugin = mongoose_1.default.model('Plugin', PluginSchema);
exports.default = Plugin;
