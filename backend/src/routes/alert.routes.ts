import { Router } from 'express';
import { AlertController } from '../controllers/alert.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: Get all alerts for user
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: read
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of alerts
 */
router.get('/', authenticate, AlertController.getAlerts);

/**
 * @swagger
 * /api/alerts/unread-count:
 *   get:
 *     summary: Get unread alert count
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 */
router.get('/unread-count', authenticate, AlertController.getUnreadCount);

/**
 * @swagger
 * /api/alerts:
 *   post:
 *     summary: Create system alert (Admin only)
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *               - message
 *               - severity
 *             properties:
 *               userId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [WEATHER, OPERATIONAL, SAFETY, SYSTEM, MAINTENANCE]
 *               message:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [NORMAL, MONITOR, CAUTION, RESTRICTED, SEVERE, CRITICAL]
 *               actionUrl:
 *                 type: string
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Alert created successfully
 */
router.post('/', authenticate, authorize('ADMIN'), AlertController.createAlert);

/**
 * @swagger
 * /api/alerts/{id}:
 *   get:
 *     summary: Get alert by ID
 *     tags: [Alerts]
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
 *         description: Alert data
 */
router.get('/:id', authenticate, AlertController.getById);

/**
 * @swagger
 * /api/alerts/{id}/read:
 *   put:
 *     summary: Mark alert as read
 *     tags: [Alerts]
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
 *         description: Alert marked as read
 */
router.put('/:id/read', authenticate, AlertController.markRead);

/**
 * @swagger
 * /api/alerts/mark-all-read:
 *   put:
 *     summary: Mark all alerts as read
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All alerts marked as read
 */
router.put('/mark-all-read', authenticate, AlertController.markAllRead);

/**
 * @swagger
 * /api/alerts/{id}/acknowledge:
 *   put:
 *     summary: Acknowledge alert
 *     tags: [Alerts]
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
 *         description: Alert acknowledged
 */
router.put('/:id/acknowledge', authenticate, AlertController.acknowledge);

/**
 * @swagger
 * /api/alerts/{id}:
 *   delete:
 *     summary: Delete alert
 *     tags: [Alerts]
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
 *         description: Alert deleted successfully
 */
router.delete('/:id', authenticate, AlertController.delete);

export default router;