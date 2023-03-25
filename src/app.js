"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Cria o app
exports.app = (0, express_1.default)();
// Configuração dos middlewares
exports.app.use(express_1.default.json());
exports.app.use((0, cors_1.default)());
