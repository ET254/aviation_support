"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const impact_controller_1 = require("../controllers/impact.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/generate', auth_1.authenticate, impact_controller_1.ImpactController.generate);
router.get('/role/:role', auth_1.authenticate, impact_controller_1.ImpactController.getByRole);
router.get('/logs', auth_1.authenticate, impact_controller_1.ImpactController.getLogs);
router.get('/:stationId/stats', auth_1.authenticate, impact_controller_1.ImpactController.getStats);
router.get('/:stationId/ladder', auth_1.authenticate, impact_controller_1.ImpactController.getDecisionLadder);
router.get('/:stationId/actions', auth_1.authenticate, impact_controller_1.ImpactController.getActions);
router.put('/:id/acknowledge', auth_1.authenticate, impact_controller_1.ImpactController.acknowledge);
exports.default = router;
//# sourceMappingURL=impact.routes.js.map