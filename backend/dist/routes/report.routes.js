"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/weather', auth_1.authenticate, report_controller_1.ReportController.generateWeatherReport);
router.get('/impact', auth_1.authenticate, report_controller_1.ReportController.generateImpactReport);
router.get('/operational', auth_1.authenticate, report_controller_1.ReportController.generateOperationalReport);
router.get('/export-csv', auth_1.authenticate, report_controller_1.ReportController.exportCSV);
router.get('/export-excel', auth_1.authenticate, report_controller_1.ReportController.exportExcel);
router.get('/templates', auth_1.authenticate, report_controller_1.ReportController.getTemplates);
exports.default = router;
//# sourceMappingURL=report.routes.js.map