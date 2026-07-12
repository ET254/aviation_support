import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/reports/weather:
 *   get:
 *     summary: Generate weather report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, pdf]
 *           default: json
 *     responses:
 *       200:
 *         description: Weather report generated
 */
router.get('/weather', authenticate, ReportController.generateWeatherReport);

/**
 * @swagger
 * /api/reports/impact:
 *   get:
 *     summary: Generate impact report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, pdf]
 *           default: json
 *     responses:
 *       200:
 *         description: Impact report generated
 */
router.get('/impact', authenticate, ReportController.generateImpactReport);

/**
 * @swagger
 * /api/reports/operational:
 *   get:
 *     summary: Generate operational report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, pdf]
 *           default: json
 *     responses:
 *       200:
 *         description: Operational report generated
 */
router.get('/operational', authenticate, ReportController.generateOperationalReport);

/**
 * @swagger
 * /api/reports/export-csv:
 *   get:
 *     summary: Export data to CSV
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: dataType
 *         schema:
 *           type: string
 *           enum: [weather, impact, forecast]
 *           default: weather
 *     responses:
 *       200:
 *         description: CSV file downloaded
 */
router.get('/export-csv', authenticate, ReportController.exportCSV);

/**
 * @swagger
 * /api/reports/export-excel:
 *   get:
 *     summary: Export data to Excel
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: dataType
 *         schema:
 *           type: string
 *           enum: [weather, impact, forecast]
 *           default: weather
 *     responses:
 *       200:
 *         description: Excel file downloaded
 */
router.get('/export-excel', authenticate, ReportController.exportExcel);

/**
 * @swagger
 * /api/reports/templates:
 *   get:
 *     summary: Get report templates
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of report templates
 */
router.get('/templates', authenticate, ReportController.getTemplates);

export default router;