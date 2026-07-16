"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const threshold_controller_1 = require("../controllers/threshold.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), threshold_controller_1.ThresholdController.create);
router.get('/:stationId', auth_1.authenticate, threshold_controller_1.ThresholdController.getByStation);
router.get('/:stationId/role/:role', auth_1.authenticate, threshold_controller_1.ThresholdController.getByRole);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), threshold_controller_1.ThresholdController.update);
router.put('/:id/toggle', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), threshold_controller_1.ThresholdController.toggleActive);
router.post('/:stationId/apply-defaults', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), threshold_controller_1.ThresholdController.applyDefaults);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), threshold_controller_1.ThresholdController.delete);
exports.default = router;
//# sourceMappingURL=threshold.routes.js.map