"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const weather_controller_1 = require("../controllers/weather.controller");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('METEOROLOGIST', 'ADMIN'), auth_1.requireStation, weather_controller_1.WeatherController.create);
router.get('/latest', auth_1.authenticate, weather_controller_1.WeatherController.getLatestAllStations);
router.get('/:stationId/current', auth_1.authenticate, weather_controller_1.WeatherController.getCurrent);
router.get('/:stationId/historical', auth_1.authenticate, weather_controller_1.WeatherController.getHistorical);
router.get('/:stationId/trends', auth_1.authenticate, weather_controller_1.WeatherController.getTrends);
router.get('/:stationId/stats', auth_1.authenticate, weather_controller_1.WeatherController.getStats);
router.post('/import', auth_1.authenticate, (0, auth_1.authorize)('METEOROLOGIST', 'ADMIN'), upload_1.uploadSingle, weather_controller_1.WeatherController.importData);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('METEOROLOGIST', 'ADMIN'), weather_controller_1.WeatherController.update);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('METEOROLOGIST', 'ADMIN'), weather_controller_1.WeatherController.delete);
exports.default = router;
//# sourceMappingURL=weather.routes.js.map