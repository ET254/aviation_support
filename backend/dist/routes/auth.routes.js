"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const validators_1 = require("../utils/validators");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const refreshLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 50,
});
const router = (0, express_1.Router)();
router.post('/register', (0, validate_1.validate)(validators_1.registerSchema), auth_controller_1.AuthController.register);
router.post('/login', (0, validate_1.validate)(validators_1.loginSchema), auth_controller_1.AuthController.login);
router.post('/refresh', refreshLimiter, auth_controller_1.AuthController.refreshToken);
router.post('/logout', auth_1.authenticate, auth_controller_1.AuthController.logout);
router.get('/me', auth_1.authenticate, auth_controller_1.AuthController.getCurrentUser);
router.post('/change-password', auth_1.authenticate, (0, validate_1.validate)(validators_1.changePasswordSchema), auth_controller_1.AuthController.changePassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map