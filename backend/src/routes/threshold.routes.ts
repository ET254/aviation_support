import { Router } from 'express';
import { ThresholdController } from '../controllers/threshold.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/thresholds:
 *   post:
 *     summary: Create threshold
 *     tags: [Thresholds]
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
 *               - parameter
 *               - severityLevel
 *               - actionRequired
 *             properties:
 *               stationId:
 *                 type: string
 *               parameter:
 *                 type: string
 *               minValue:
 *                 type: number
 *               maxValue:
 *                 type: number
 *               severityLevel:
 *                 type: string
 *                 enum: [NORMAL, MONITOR, CAUTION, RESTRICTED, SEVERE, CRITICAL]
 *               actionRequired:
 *                 type: string
 *               userRole:
 *                 type: string
 *                 enum: [ADMIN, METEOROLOGIST, DISPATCHER, PILOT, ATC, OPERATIONS, GROUND_HANDLER]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Threshold created successfully
 */
router.post('/', authenticate, authorize('ADMIN'), ThresholdController.create);

/**
 * @swagger
 * /api/thresholds/{stationId}:
 *   get:
 *     summary: Get all thresholds for station
 *     tags: [Thresholds]
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
 *         description: List of thresholds
 */
router.get('/:stationId', authenticate, ThresholdController.getByStation);

/**
 * @swagger
 * /api/thresholds/{stationId}/role/{role}:
 *   get:
 *     summary: Get thresholds by role
 *     tags: [Thresholds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ADMIN, METEOROLOGIST, DISPATCHER, PILOT, ATC, OPERATIONS, GROUND_HANDLER]
 *     responses:
 *       200:
 *         description: Role-based thresholds
 */
router.get('/:stationId/role/:role', authenticate, ThresholdController.getByRole);

/**
 * @swagger
 * /api/thresholds/{id}:
 *   put:
 *     summary: Update threshold
 *     tags: [Thresholds]
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
 *         description: Threshold updated successfully
 */
router.put('/:id', authenticate, authorize('ADMIN'), ThresholdController.update);

/**
 * @swagger
 * /api/thresholds/{id}/toggle:
 *   put:
 *     summary: Toggle threshold active status
 *     tags: [Thresholds]
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
 *         description: Threshold toggled successfully
 */
router.put('/:id/toggle', authenticate, authorize('ADMIN'), ThresholdController.toggleActive);

/**
 * @swagger
 * /api/thresholds/{stationId}/apply-defaults:
 *   post:
 *     summary: Apply default thresholds to station
 *     tags: [Thresholds]
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
 *         description: Default thresholds applied
 */
router.post('/:stationId/apply-defaults', authenticate, authorize('ADMIN'), ThresholdController.applyDefaults);

/**
 * @swagger
 * /api/thresholds/{id}:
 *   delete:
 *     summary: Delete threshold
 *     tags: [Thresholds]
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
 *         description: Threshold deleted successfully
 */
router.delete('/:id', authenticate, authorize('ADMIN'), ThresholdController.delete);

export default router;