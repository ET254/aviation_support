"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const station_controller_1 = require("../controllers/station.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, station_controller_1.StationController.getAll);
router.get('/active', auth_1.authenticate, station_controller_1.StationController.getActive);
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), station_controller_1.StationController.create);
router.get('/:id', auth_1.authenticate, station_controller_1.StationController.getById);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), station_controller_1.StationController.update);
router.put('/:id/active', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), station_controller_1.StationController.setActive);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), station_controller_1.StationController.delete);
router.get('/:id/stats', auth_1.authenticate, station_controller_1.StationController.getStats);
exports.default = router;
//# sourceMappingURL=station.routes.js.map