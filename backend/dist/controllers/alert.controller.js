"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertController = void 0;
const prisma_1 = require("../utils/prisma");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
const alert_service_1 = require("../services/alert.service");
class AlertController {
    static async getAlerts(req, res) {
        try {
            const userId = req.user.id;
            const { read, limit = 50, offset = 0 } = req.query;
            const where = { userId };
            if (read !== undefined) {
                where.readStatus = read === 'true';
            }
            const alerts = await prisma_1.prisma.alert.findMany({
                where,
                orderBy: { timestamp: 'desc' },
                take: parseInt(limit, 10),
                skip: parseInt(offset, 10),
            });
            const total = await prisma_1.prisma.alert.count({ where });
            res.json({
                success: true,
                data: alerts,
                pagination: {
                    total,
                    limit: parseInt(limit, 10),
                    offset: parseInt(offset, 10),
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Get alerts error:', error);
            throw new errorHandler_1.AppError('Failed to get alerts', 500);
        }
    }
    static async getUnreadCount(req, res) {
        try {
            const userId = req.user.id;
            const count = await prisma_1.prisma.alert.count({
                where: {
                    userId,
                    readStatus: false,
                },
            });
            res.json({
                success: true,
                data: { unread: count },
            });
        }
        catch (error) {
            logger_1.logger.error('Get unread count error:', error);
            throw new errorHandler_1.AppError('Failed to get unread count', 500);
        }
    }
    static async markRead(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const alert = await prisma_1.prisma.alert.findFirst({
                where: { id, userId },
            });
            if (!alert) {
                throw new errorHandler_1.AppError('Alert not found', 404);
            }
            const updated = await prisma_1.prisma.alert.update({
                where: { id },
                data: { readStatus: true },
            });
            res.json({
                success: true,
                message: 'Alert marked as read',
                data: updated,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Mark alert read error:', error);
            throw new errorHandler_1.AppError('Failed to mark alert as read', 500);
        }
    }
    static async markAllRead(req, res) {
        try {
            const userId = req.user.id;
            await prisma_1.prisma.alert.updateMany({
                where: {
                    userId,
                    readStatus: false,
                },
                data: { readStatus: true },
            });
            res.json({
                success: true,
                message: 'All alerts marked as read',
            });
        }
        catch (error) {
            logger_1.logger.error('Mark all alerts read error:', error);
            throw new errorHandler_1.AppError('Failed to mark all alerts as read', 500);
        }
    }
    static async acknowledge(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const alert = await prisma_1.prisma.alert.findFirst({
                where: { id, userId },
            });
            if (!alert) {
                throw new errorHandler_1.AppError('Alert not found', 404);
            }
            const updated = await prisma_1.prisma.alert.update({
                where: { id },
                data: {
                    readStatus: true,
                    acknowledgedAt: new Date(),
                },
            });
            await prisma_1.prisma.auditLog.create({
                data: {
                    userId,
                    action: 'ACKNOWLEDGE_ALERT',
                    entity: 'Alert',
                    entityId: id,
                    changes: { acknowledged: true },
                },
            });
            res.json({
                success: true,
                message: 'Alert acknowledged',
                data: updated,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Acknowledge alert error:', error);
            throw new errorHandler_1.AppError('Failed to acknowledge alert', 500);
        }
    }
    static async createAlert(req, res) {
        try {
            const { userId, type, message, severity, actionUrl, expiresAt } = req.body;
            const alert = await prisma_1.prisma.alert.create({
                data: {
                    userId,
                    type,
                    message,
                    severity,
                    actionUrl,
                    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
                },
            });
            logger_1.logger.info(`Alert created for user ${userId}: ${type}`);
            await alert_service_1.AlertService.sendNotification(alert);
            res.status(201).json({
                success: true,
                message: 'Alert created successfully',
                data: alert,
            });
        }
        catch (error) {
            logger_1.logger.error('Create alert error:', error);
            throw new errorHandler_1.AppError('Failed to create alert', 500);
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const alert = await prisma_1.prisma.alert.findFirst({
                where: {
                    id,
                    OR: [
                        { userId },
                        { user: { role: 'ADMIN' } },
                    ],
                },
            });
            if (!alert) {
                throw new errorHandler_1.AppError('Alert not found or unauthorized', 404);
            }
            await prisma_1.prisma.alert.delete({
                where: { id },
            });
            res.json({
                success: true,
                message: 'Alert deleted successfully',
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Delete alert error:', error);
            throw new errorHandler_1.AppError('Failed to delete alert', 500);
        }
    }
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const alert = await prisma_1.prisma.alert.findFirst({
                where: {
                    id,
                    OR: [
                        { userId },
                        { user: { role: 'ADMIN' } },
                    ],
                },
            });
            if (!alert) {
                throw new errorHandler_1.AppError('Alert not found', 404);
            }
            res.json({
                success: true,
                data: alert,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Get alert error:', error);
            throw new errorHandler_1.AppError('Failed to get alert', 500);
        }
    }
}
exports.AlertController = AlertController;
//# sourceMappingURL=alert.controller.js.map