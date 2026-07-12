import { Router } from 'express';
import { WeatherController } from '../controllers/weather.controller';
import { authenticate, authorize, requireStation } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';

const router = Router();

/**
 * @swagger
 * /api/weather:
 *   post:
 *     summary: Add weather data
 *     tags: [Weather]
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
 *               - timestamp
 *             properties:
 *               stationId:
 *                 type: string
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               temperature:
 *                 type: number
 *               windDirection:
 *                 type: number
 *               windSpeed:
 *                 type: number
 *               gustSpeed:
 *                 type: number
 *               visibility:
 *                 type: number
 *               rvr:
 *                 type: number
 *               pressureQnh:
 *                 type: number
 *               pressureQfe:
 *                 type: number
 *               humidity:
 *                 type: number
 *               dewPoint:
 *                 type: number
 *               cloudAmount:
 *                 type: number
 *               cloudBase:
 *                 type: number
 *               cloudType:
 *                 type: string
 *                 enum: [CLEAR, FEW, SCATTERED, BROKEN, OVERCAST, VERTICAL_DEVELOPMENT]
 *               precipitationType:
 *                 type: string
 *                 enum: [NONE, RAIN, SNOW, SLEET, HAIL, FREEZING_RAIN]
 *               precipitationIntensity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Weather data added successfully
 */
router.post('/', authenticate, authorize('METEOROLOGIST', 'ADMIN'), requireStation, WeatherController.create);

/**
 * Get latest weather for all stations
 */
router.get(
  '/latest',
  authenticate,
  WeatherController.getLatestAllStations
);

/**
 * @swagger
 * /api/weather/{stationId}/current:
 *   get:
 *     summary: Get current weather
 *     tags: [Weather]
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
 *         description: Current weather data
 */
router.get('/:stationId/current', authenticate, WeatherController.getCurrent);

/**
 * @swagger
 * /api/weather/{stationId}/historical:
 *   get:
 *     summary: Get historical weather data
 *     tags: [Weather]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *     responses:
 *       200:
 *         description: Historical weather data
 */
router.get('/:stationId/historical', authenticate, WeatherController.getHistorical);

/**
 * @swagger
 * /api/weather/{stationId}/trends:
 *   get:
 *     summary: Get weather trends
 *     tags: [Weather]
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
 *         description: Weather trends data
 */
router.get('/:stationId/trends', authenticate, WeatherController.getTrends);

/**
 * @swagger
 * /api/weather/{stationId}/stats:
 *   get:
 *     summary: Get weather statistics
 *     tags: [Weather]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *     responses:
 *       200:
 *         description: Weather statistics
 */
router.get('/:stationId/stats', authenticate, WeatherController.getStats);

/**
 * @swagger
 * /api/weather/import:
 *   post:
 *     summary: Import weather data from file
 *     tags: [Weather]
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
 *         description: Data imported successfully
 */
router.post('/import', authenticate, authorize('METEOROLOGIST', 'ADMIN'), uploadSingle, WeatherController.importData);

/**
 * @swagger
 * /api/weather/{id}:
 *   put:
 *     summary: Update weather data
 *     tags: [Weather]
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
 *         description: Weather data updated successfully
 */
router.put('/:id', authenticate, authorize('METEOROLOGIST', 'ADMIN'), WeatherController.update);

/**
 * @swagger
 * /api/weather/{id}:
 *   delete:
 *     summary: Delete weather data
 *     tags: [Weather]
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
 *         description: Weather data deleted successfully
 */
router.delete('/:id', authenticate, authorize('METEOROLOGIST', 'ADMIN'), WeatherController.delete);

export default router;