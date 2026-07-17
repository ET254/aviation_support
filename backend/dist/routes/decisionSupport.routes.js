"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const decisionSupport_controller_1 = require("../controllers/decisionSupport.controller");
const router = (0, express_1.Router)();
router.get("/station/:stationId", decisionSupport_controller_1.DecisionSupportController.evaluateStation);
router.post("/evaluate", decisionSupport_controller_1.DecisionSupportController.evaluateObservation);
router.get("/dashboard/:stationId", decisionSupport_controller_1.DecisionSupportController.dashboard);
exports.default = router;
//# sourceMappingURL=decisionSupport.routes.js.map