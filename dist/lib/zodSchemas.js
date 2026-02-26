"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthorBodySchema = exports.getPluginBodySchema = exports.getPluginsByQueryBodySchema = exports.getPluginsBodySchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.getPluginsBodySchema = zod_1.default.object({
    skip: zod_1.default.number().min(0),
    count: zod_1.default.number().min(0).max(50)
});
exports.getPluginsByQueryBodySchema = exports.getPluginsBodySchema.extend({
    query: zod_1.default.string().min(1)
});
exports.getPluginBodySchema = zod_1.default.object({
    name: zod_1.default.string().min(1)
});
exports.getAuthorBodySchema = zod_1.default.object({
    name: zod_1.default.string().min(1)
});
