"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alert_controller_1 = require("../controllers/alert.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, alert_controller_1.AlertController.getAlerts);
router.get('/unread-count', auth_1.authenticate, alert_controller_1.AlertController.getUnreadCount);
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), alert_controller_1.AlertController.createAlert);
router.get('/:id', auth_1.authenticate, alert_controller_1.AlertController.getById);
router.put('/:id/read', auth_1.authenticate, alert_controller_1.AlertController.markRead);
router.put('/mark-all-read', auth_1.authenticate, alert_controller_1.AlertController.markAllRead);
router.put('/:id/acknowledge', auth_1.authenticate, alert_controller_1.AlertController.acknowledge);
router.delete('/:id', auth_1.authenticate, alert_controller_1.AlertController.delete);
exports.default = router;
//# sourceMappingURL=alert.routes.js.map