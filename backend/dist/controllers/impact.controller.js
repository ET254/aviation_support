"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImpactController = void 0;
const prisma_1 = require("../utils/prisma");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
const impact_service_1 = require("../services/impact.service");
class ImpactController {
    static async generate(req, res) {
        try {
            const { stationId, role } = req.query;
            if (!stationId) {
                throw new errorHandler_1.AppError('Station ID required', 400);
            }
            const weather = await prisma_1.prisma.weatherData.findFirst({
                where: { stationId: stationId },
                orderBy: { timestamp: 'desc' },
                include: {
                    station: true,
                },
            });
            if (!weather) {
                throw new errorHandler_1.AppError('No weather data available for this station', 404);
            }
            const thresholds = await prisma_1.prisma.threshold.findMany({
                where: {
                    stationId: stationId,
                    isActive: true,
                    ...(role && { userRole: role }),
                },
            });
            const impact = impact_service_1.ImpactService.assessImpact(weather, thresholds, role || undefined);
            await prisma_1.prisma.impactLog.create({
                data: {
                    userId: req.user.id,
                    stationId: stationId,
                    eventType: 'WEATHER',
                    severity: impact.overallSeverity,
                    description: impact.summary,
                    metadata: impact,
                },
            });
            res.json({
                success: true,
                data: impact,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Generate impact error:', error);
            throw new errorHandler_1.AppError('Failed to generate impact assessment', 500);
        }
    }
    static async getByRole(req, res) {
        try {
            const { role } = req.params;
            const { stationId } = req.query;
            if (!stationId) {
                throw new errorHandler_1.AppError('Station ID required', 400);
            }
            const impacts = await impact_service_1.ImpactService.getImpactsByRole(stationId, role);
            res.json({
                success: true,
                data: impacts,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Get impacts by role error:', error);
            throw new errorHandler_1.AppError('Failed to get impacts by role', 500);
        }
    }
    static async getLogs(req, res) {
        try {
            const { stationId, userId, severity, startDate, endDate, limit = 50 } = req.query;
            const where = {};
            if (stationId)
                where.stationId = stationId;
            if (userId)
                where.userId = userId;
            if (severity)
                where.severity = severity;
            if (startDate)
                where.timestamp = { gte: new Date(startDate) };
            if (endDate)
                where.timestamp = { ...where.timestamp, lte: new Date(endDate) };
            const logs = await prisma_1.prisma.impactLog.findMany({
                where,
                orderBy: { timestamp: 'desc' },
                take: parseInt(limit, 10),
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                    station: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            });
            res.json({
                success: true,
                data: logs,
                count: logs.length,
            });
        }
        catch (error) {
            logger_1.logger.error('Get impact logs error:', error);
            throw new errorHandler_1.AppError('Failed to get impact logs', 500);
        }
    }
    static async getStats(req, res) {
        try {
            const { stationId } = req.params;
            const { days = 7 } = req.query;
            const startDate = new Date(Date.now() - parseInt(days, 10) * 86400000);
            const stats = await prisma_1.prisma.impactLog.groupBy({
                by: ['severity'],
                where: {
                    stationId,
                    timestamp: { gte: startDate },
                },
                _count: {
                    severity: true,
                },
            });
            const total = await prisma_1.prisma.impactLog.count({
                where: {
                    stationId,
                    timestamp: { gte: startDate },
                },
            });
            res.json({
                success: true,
                data: {
                    total,
                    bySeverity: stats.map(s => ({
                        severity: s.severity,
                        count: s._count.severity,
                        percentage: total > 0 ? (s._count.severity / total) * 100 : 0,
                    })),
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Get impact stats error:', error);
            throw new errorHandler_1.AppError('Failed to get impact statistics', 500);
        }
    }
    static async acknowledge(req, res) {
        try {
            const { id } = req.params;
            const impact = await prisma_1.prisma.impactLog.update({
                where: { id },
                data: {
                    isResolved: true,
                    resolvedAt: new Date(),
                    actionTaken: req.body.actionTaken || 'Acknowledged',
                },
            });
            logger_1.logger.info(`Impact acknowledged: ${id}`);
            res.json({
                success: true,
                message: 'Impact acknowledged successfully',
                data: impact,
            });
        }
        catch (error) {
            logger_1.logger.error('Acknowledge impact error:', error);
            throw new errorHandler_1.AppError('Failed to acknowledge impact', 500);
        }
    }
    static async getDecisionLadder(req, res) {
        try {
            const { stationId } = req.params;
            const { role } = req.query;
            if (!stationId) {
                throw new errorHandler_1.AppError('Station ID required', 400);
            }
            const ladder = await impact_service_1.ImpactService.getDecisionLadder(stationId, role || undefined);
            res.json({
                success: true,
                data: ladder,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Get decision ladder error:', error);
            throw new errorHandler_1.AppError('Failed to get decision ladder', 500);
        }
    }
    static async getActions(req, res) {
        try {
            const { stationId } = req.params;
            const { role } = req.query;
            if (!stationId) {
                throw new errorHandler_1.AppError('Station ID required', 400);
            }
            const actions = await impact_service_1.ImpactService.getActionRecommendations(stationId, role || undefined);
            res.json({
                success: true,
                data: actions,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Get actions error:', error);
            throw new errorHandler_1.AppError('Failed to get action recommendations', 500);
        }
    }
}
exports.ImpactController = ImpactController;
//# sourceMappingURL=impact.controller.js.map