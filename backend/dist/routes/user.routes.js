"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), user_controller_1.UserController.getAll);
router.get('/stats', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), user_controller_1.UserController.getStats);
router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), user_controller_1.UserController.getById);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), user_controller_1.UserController.update);
router.post('/:id/reset-password', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), user_controller_1.UserController.resetPassword);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), user_controller_1.UserController.delete);
router.put('/preferences', auth_1.authenticate, user_controller_1.UserController.updatePreferences);
exports.default = router;
//# sourceMappingURL=user.routes.js.map