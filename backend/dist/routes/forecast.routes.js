"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const forecast_controller_1 = require("../controllers/forecast.controller");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('METEOROLOGIST', 'ADMIN'), forecast_controller_1.ForecastController.create);
router.get('/:stationId/current', auth_1.authenticate, forecast_controller_1.ForecastController.getCurrent);
router.get('/:stationId/taf', auth_1.authenticate, forecast_controller_1.ForecastController.getTAF);
router.get('/:stationId/sigmet', auth_1.authenticate, forecast_controller_1.ForecastController.getSIGMET);
router.get('/:stationId/upper-air', auth_1.authenticate, forecast_controller_1.ForecastController.getUpperAir);
router.get('/:stationId/timeline', auth_1.authenticate, forecast_controller_1.ForecastController.getTimeline);
router.post('/import-netcdf', auth_1.authenticate, (0, auth_1.authorize)('METEOROLOGIST', 'ADMIN'), upload_1.uploadSingle, forecast_controller_1.ForecastController.importNetCDF);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('METEOROLOGIST', 'ADMIN'), forecast_controller_1.ForecastController.update);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('METEOROLOGIST', 'ADMIN'), forecast_controller_1.ForecastController.delete);
exports.default = router;
//# sourceMappingURL=forecast.routes.js.map