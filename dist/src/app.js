"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("./middleware/auth");
const months_1 = require("./routes/months");
const habits_1 = require("./routes/habits");
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.get('/health', (_, res) => res.json({ status: 'ok' }));
exports.app.use(auth_1.requireAuth);
exports.app.use('/months', months_1.monthsRouter);
exports.app.use('/', habits_1.habitsRouter);
