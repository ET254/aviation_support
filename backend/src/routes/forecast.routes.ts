import { Router } from 'express';
import { ForecastController } from '../controllers/forecast.controller';
import { authenticate, authorize } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';

const router = Router();

/**
 * @swagger
 * /api/forecast:
 *   post:
 *     summary: Create forecast
 *     tags: [Forecast]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stationId
 *               - validFrom
 *               - validTo
 *             properties:
 *               stationId:
 *                 type: string
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *               validTo:
 *                 type: string
 *                 format: date-time
 *               taf:
 *                 type: string
 *               sigmetData:
 *                 type: object
 *               upperWind:
 *                 type: object
 *               upperTemp:
 *                 type: object
 *               freezingLevel:
 *                 type: number
 *               turbulenceForecast:
 *                 type: string
 *               icingForecast:
 *                 type: string
 *     responses:
 *       201:
 *         description: Forecast created successfully
 */
router.post('/', authenticate, authorize('METEOROLOGIST', 'ADMIN'), ForecastController.create);

/**
 * @swagger
 * /api/forecast/{stationId}/current:
 *   get:
 *     summary: Get current forecast
 *     tags: [Forecast]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Current forecast data
 */
router.get('/:stationId/current', authenticate, ForecastController.getCurrent);

/**
 * @swagger
 * /api/forecast/{stationId}/taf:
 *   get:
 *     summary: Get TAF
 *     tags: [Forecast]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: TAF data
 */
router.get('/:stationId/taf', authenticate, ForecastController.getTAF);

/**
 * @swagger
 * /api/forecast/{stationId}/sigmet:
 *   get:
 *     summary: Get SIGMET
 *     tags: [Forecast]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: SIGMET data
 */
router.get('/:stationId/sigmet', authenticate, ForecastController.getSIGMET);

/**
 * @swagger
 * /api/forecast/{stationId}/upper-air:
 *   get:
 *     summary: Get upper air data
 *     tags: [Forecast]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: level
 *         schema:
 *           type: integer
 *           description: Pressure level in hPa
 *     responses:
 *       200:
 *         description: Upper air data
 */
router.get('/:stationId/upper-air', authenticate, ForecastController.getUpperAir);

/**
 * @swagger
 * /api/forecast/{stationId}/timeline:
 *   get:
 *     summary: Get forecast timeline
 *     tags: [Forecast]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 24
 *     responses:
 *       200:
 *         description: Forecast timeline
 */
router.get('/:stationId/timeline', authenticate, ForecastController.getTimeline);

/**
 * @swagger
 * /api/forecast/import-netcdf:
 *   post:
 *     summary: Import NetCDF forecast data
 *     tags: [Forecast]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - stationId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               stationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: NetCDF data imported successfully
 */
router.post('/import-netcdf', authenticate, authorize('METEOROLOGIST', 'ADMIN'), uploadSingle, ForecastController.importNetCDF);

/**
 * @swagger
 * /api/forecast/{id}:
 *   put:
 *     summary: Update forecast
 *     tags: [Forecast]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Forecast updated successfully
 */
router.put('/:id', authenticate, authorize('METEOROLOGIST', 'ADMIN'), ForecastController.update);

/**
 * @swagger
 * /api/forecast/{id}:
 *   delete:
 *     summary: Delete forecast
 *     tags: [Forecast]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Forecast deleted successfully
 */
router.delete('/:id', authenticate, authorize('METEOROLOGIST', 'ADMIN'), ForecastController.delete);

export default router;