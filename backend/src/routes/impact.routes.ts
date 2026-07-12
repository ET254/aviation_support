import { Router } from 'express';
import { ImpactController } from '../controllers/impact.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/impacts/generate:
 *   get:
 *     summary: Generate impact assessment
 *     tags: [Impacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, METEOROLOGIST, DISPATCHER, PILOT, ATC, OPERATIONS, GROUND_HANDLER]
 *     responses:
 *       200:
 *         description: Impact assessment generated
 */
router.get('/generate', authenticate, ImpactController.generate);

/**
 * @swagger
 * /api/impacts/role/{role}:
 *   get:
 *     summary: Get impacts by role
 *     tags: [Impacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ADMIN, METEOROLOGIST, DISPATCHER, PILOT, ATC, OPERATIONS, GROUND_HANDLER]
 *       - in: query
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role-based impacts
 */
router.get('/role/:role', authenticate, ImpactController.getByRole);

/**
 * @swagger
 * /api/impacts/logs:
 *   get:
 *     summary: Get impact logs
 *     tags: [Impacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: stationId
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [NORMAL, MONITOR, CAUTION, RESTRICTED, SEVERE, CRITICAL]
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
 *           default: 50
 *     responses:
 *       200:
 *         description: Impact logs retrieved
 */
router.get('/logs', authenticate, ImpactController.getLogs);

/**
 * @swagger
 * /api/impacts/{stationId}/stats:
 *   get:
 *     summary: Get impact statistics
 *     tags: [Impacts]
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
 *         description: Impact statistics
 */
router.get('/:stationId/stats', authenticate, ImpactController.getStats);

/**
 * @swagger
 * /api/impacts/{stationId}/ladder:
 *   get:
 *     summary: Get decision support ladder
 *     tags: [Impacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, METEOROLOGIST, DISPATCHER, PILOT, ATC, OPERATIONS, GROUND_HANDLER]
 *     responses:
 *       200:
 *         description: Decision support ladder
 */
router.get('/:stationId/ladder', authenticate, ImpactController.getDecisionLadder);

/**
 * @swagger
 * /api/impacts/{stationId}/actions:
 *   get:
 *     summary: Get action recommendations
 *     tags: [Impacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, METEOROLOGIST, DISPATCHER, PILOT, ATC, OPERATIONS, GROUND_HANDLER]
 *     responses:
 *       200:
 *         description: Action recommendations
 */
router.get('/:stationId/actions', authenticate, ImpactController.getActions);

/**
 * @swagger
 * /api/impacts/{id}/acknowledge:
 *   put:
 *     summary: Acknowledge impact
 *     tags: [Impacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               actionTaken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Impact acknowledged
 */
router.put('/:id/acknowledge', authenticate, ImpactController.acknowledge);

export default router;