import { Router } from 'express';
import { StationController } from '../controllers/station.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/stations:
 *   get:
 *     summary: Get all stations
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all stations
 */
router.get('/', authenticate, StationController.getAll);

/**
 * @swagger
 * /api/stations/active:
 *   get:
 *     summary: Get active station
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active station data
 *       404:
 *         description: No active station found
 */
router.get('/active', authenticate, StationController.getActive);

/**
 * @swagger
 * /api/stations:
 *   post:
 *     summary: Create a new station
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - latitude
 *               - longitude
 *               - elevation
 *               - terrainType
 *               - topographyDescription
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               wmoId:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               elevation:
 *                 type: number
 *               terrainType:
 *                 type: string
 *                 enum: [HIGHLANDS, COASTAL, LAKE_REGION, SEMI_ARID, VALLEY_MOUNTAIN, PLAINS, DESERT]
 *               topographyDescription:
 *                 type: string
 *               runwayLength:
 *                 type: number
 *               runwayOrientation:
 *                 type: string
 *               runwaySurface:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [INTERNATIONAL, DOMESTIC, AERODROME, AIRSTRIP]
 *     responses:
 *       201:
 *         description: Station created successfully
 */
router.post('/', authenticate, authorize('ADMIN'), StationController.create);

/**
 * @swagger
 * /api/stations/{id}:
 *   get:
 *     summary: Get station by ID
 *     tags: [Stations]
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
 *         description: Station data retrieved
 *       404:
 *         description: Station not found
 */
router.get('/:id', authenticate, StationController.getById);

/**
 * @swagger
 * /api/stations/{id}:
 *   put:
 *     summary: Update station
 *     tags: [Stations]
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
 *         description: Station updated successfully
 */
router.put('/:id', authenticate, authorize('ADMIN'), StationController.update);

/**
 * @swagger
 * /api/stations/{id}/active:
 *   put:
 *     summary: Set active station
 *     tags: [Stations]
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
 *         description: Active station updated
 */
router.put('/:id/active', authenticate, authorize('ADMIN'), StationController.setActive);

/**
 * @swagger
 * /api/stations/{id}:
 *   delete:
 *     summary: Delete station
 *     tags: [Stations]
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
 *         description: Station deleted successfully
 */
router.delete('/:id', authenticate, authorize('ADMIN'), StationController.delete);

/**
 * @swagger
 * /api/stations/{id}/stats:
 *   get:
 *     summary: Get station statistics
 *     tags: [Stations]
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
 *         description: Station statistics retrieved
 */
router.get('/:id/stats', authenticate, StationController.getStats);

export default router;