"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
const report_service_1 = require("../services/report.service");
class ReportController {
    static async generateWeatherReport(req, res) {
        try {
            const { stationId, startDate, endDate, format = 'json' } = req.query;
            if (!stationId || !startDate || !endDate) {
                throw new errorHandler_1.AppError('Station ID, start date, and end date are required', 400);
            }
            const report = await report_service_1.ReportService.generateWeatherReport(stationId, new Date(startDate), new Date(endDate));
            if (format === 'pdf') {
                const pdfBuffer = await report_service_1.ReportService.exportToPDF(report);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=weather-report-${Date.now()}.pdf`);
                res.send(pdfBuffer);
            }
            else {
                res.json({
                    success: true,
                    data: report,
                });
            }
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Generate weather report error:', error);
            throw new errorHandler_1.AppError('Failed to generate weather report', 500);
        }
    }
    static async generateImpactReport(req, res) {
        try {
            const { stationId, startDate, endDate, format = 'json' } = req.query;
            if (!stationId || !startDate || !endDate) {
                throw new errorHandler_1.AppError('Station ID, start date, and end date are required', 400);
            }
            const report = await report_service_1.ReportService.generateImpactReport(stationId, new Date(startDate), new Date(endDate));
            if (format === 'pdf') {
                const pdfBuffer = await report_service_1.ReportService.exportToPDF(report);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=impact-report-${Date.now()}.pdf`);
                res.send(pdfBuffer);
            }
            else {
                res.json({
                    success: true,
                    data: report,
                });
            }
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Generate impact report error:', error);
            throw new errorHandler_1.AppError('Failed to generate impact report', 500);
        }
    }
    static async generateOperationalReport(req, res) {
        try {
            const { stationId, startDate, endDate, format = 'json' } = req.query;
            if (!stationId || !startDate || !endDate) {
                throw new errorHandler_1.AppError('Station ID, start date, and end date are required', 400);
            }
            const report = await report_service_1.ReportService.generateOperationalReport(stationId, new Date(startDate), new Date(endDate));
            if (format === 'pdf') {
                const pdfBuffer = await report_service_1.ReportService.exportToPDF(report);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=operational-report-${Date.now()}.pdf`);
                res.send(pdfBuffer);
            }
            else {
                res.json({
                    success: true,
                    data: report,
                });
            }
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Generate operational report error:', error);
            throw new errorHandler_1.AppError('Failed to generate operational report', 500);
        }
    }
    static async exportCSV(req, res) {
        try {
            const { stationId, startDate, endDate, dataType = 'weather' } = req.query;
            if (!stationId || !startDate || !endDate) {
                throw new errorHandler_1.AppError('Station ID, start date, and end date are required', 400);
            }
            const csvData = await report_service_1.ReportService.exportToCSV(stationId, new Date(startDate), new Date(endDate), dataType);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${dataType}-data-${Date.now()}.csv`);
            res.send(csvData);
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Export CSV error:', error);
            throw new errorHandler_1.AppError('Failed to export CSV', 500);
        }
    }
    static async exportExcel(req, res) {
        try {
            const { stationId, startDate, endDate, dataType = 'weather' } = req.query;
            if (!stationId || !startDate || !endDate) {
                throw new errorHandler_1.AppError('Station ID, start date, and end date are required', 400);
            }
            const excelBuffer = await report_service_1.ReportService.exportToExcel(stationId, new Date(startDate), new Date(endDate), dataType);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=${dataType}-data-${Date.now()}.xlsx`);
            res.send(excelBuffer);
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Export Excel error:', error);
            throw new errorHandler_1.AppError('Failed to export Excel', 500);
        }
    }
    static async getTemplates(req, res) {
        try {
            const templates = [
                {
                    id: 'weather-summary',
                    name: 'Weather Summary Report',
                    description: 'Daily weather summary with trends and alerts',
                    sections: ['Temperature', 'Wind', 'Visibility', 'Precipitation', 'Alerts'],
                },
                {
                    id: 'impact-assessment',
                    name: 'Impact Assessment Report',
                    description: 'Role-based impact assessment and recommendations',
                    sections: ['Weather Conditions', 'Impact Analysis', 'Action Items', 'Priority Levels'],
                },
                {
                    id: 'operational-decision',
                    name: 'Operational Decision Report',
                    description: 'Operational decisions and recommendations',
                    sections: ['Flight Operations', 'Ground Operations', 'Safety Concerns', 'Recommendations'],
                },
                {
                    id: 'forecast-analysis',
                    name: 'Forecast Analysis Report',
                    description: 'Detailed forecast analysis with timeline',
                    sections: ['TAF Analysis', 'SIGMET', 'Upper Air Data', 'Trends'],
                },
            ];
            res.json({
                success: true,
                data: templates,
            });
        }
        catch (error) {
            logger_1.logger.error('Get templates error:', error);
            throw new errorHandler_1.AppError('Failed to get report templates', 500);
        }
    }
}
exports.ReportController = ReportController;
//# sourceMappingURL=report.controller.js.map