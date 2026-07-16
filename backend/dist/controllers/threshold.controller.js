"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThresholdController = void 0;
const prisma_1 = require("../utils/prisma");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
const validators_1 = require("../utils/validators");
const client_1 = require("@prisma/client");
class ThresholdController {
    static async create(req, res) {
        try {
            const validatedData = validators_1.thresholdSchema.parse(req.body);
            const existing = await prisma_1.prisma.threshold.findFirst({
                where: {
                    stationId: validatedData.stationId,
                    parameter: validatedData.parameter,
                    userRole: validatedData.userRole || null,
                },
            });
            if (existing) {
                throw new errorHandler_1.AppError('Threshold already exists for this station and parameter', 400);
            }
            const threshold = await prisma_1.prisma.threshold.create({
                data: {
                    ...validatedData,
                    severityLevel: validatedData.severityLevel,
                },
                include: {
                    station: true,
                },
            });
            logger_1.logger.info(`Threshold created for station: ${threshold.stationId}`);
            res.status(201).json({
                success: true,
                message: 'Threshold created successfully',
                data: threshold,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Create threshold error:', error);
            throw new errorHandler_1.AppError('Failed to create threshold', 500);
        }
    }
    static async getByStation(req, res) {
        try {
            const { stationId } = req.params;
            const thresholds = await prisma_1.prisma.threshold.findMany({
                where: { stationId },
                orderBy: [
                    { parameter: 'asc' },
                    { severityLevel: 'asc' },
                ],
            });
            res.json({
                success: true,
                data: thresholds,
            });
        }
        catch (error) {
            logger_1.logger.error('Get thresholds error:', error);
            throw new errorHandler_1.AppError('Failed to get thresholds', 500);
        }
    }
    static async getByRole(req, res) {
        try {
            const { stationId, role } = req.params;
            const thresholds = await prisma_1.prisma.threshold.findMany({
                where: {
                    stationId,
                    OR: [
                        { userRole: role },
                        { userRole: null },
                    ],
                    isActive: true,
                },
                orderBy: {
                    parameter: 'asc',
                },
            });
            res.json({
                success: true,
                data: thresholds,
            });
        }
        catch (error) {
            logger_1.logger.error('Get thresholds by role error:', error);
            throw new errorHandler_1.AppError('Failed to get thresholds by role', 500);
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const validatedData = validators_1.thresholdSchema.partial().parse(req.body);
            const updateData = { ...validatedData };
            if (validatedData.severityLevel) {
                updateData.severityLevel = validatedData.severityLevel;
            }
            const threshold = await prisma_1.prisma.threshold.update({
                where: { id },
                data: updateData,
                include: {
                    station: true,
                },
            });
            logger_1.logger.info(`Threshold updated: ${id}`);
            res.json({
                success: true,
                message: 'Threshold updated successfully',
                data: threshold,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Update threshold error:', error);
            throw new errorHandler_1.AppError('Failed to update threshold', 500);
        }
    }
    static async toggleActive(req, res) {
        try {
            const { id } = req.params;
            const threshold = await prisma_1.prisma.threshold.findUnique({
                where: { id },
            });
            if (!threshold) {
                throw new errorHandler_1.AppError('Threshold not found', 404);
            }
            const updated = await prisma_1.prisma.threshold.update({
                where: { id },
                data: { isActive: !threshold.isActive },
            });
            logger_1.logger.info(`Threshold ${id} active status toggled to: ${updated.isActive}`);
            res.json({
                success: true,
                message: `Threshold ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
                data: updated,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Toggle threshold error:', error);
            throw new errorHandler_1.AppError('Failed to toggle threshold', 500);
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            await prisma_1.prisma.threshold.delete({
                where: { id },
            });
            logger_1.logger.info(`Threshold deleted: ${id}`);
            res.json({
                success: true,
                message: 'Threshold deleted successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Delete threshold error:', error);
            throw new errorHandler_1.AppError('Failed to delete threshold', 500);
        }
    }
    static async applyDefaults(req, res) {
        try {
            const { stationId } = req.params;
            const station = await prisma_1.prisma.station.findUnique({
                where: { id: stationId },
            });
            if (!station) {
                throw new errorHandler_1.AppError('Station not found', 404);
            }
            const defaultThresholds = [
                { parameter: 'visibility', minValue: 10000, maxValue: null, severityLevel: client_1.SeverityLevel.NORMAL, actionRequired: 'Normal operations continue.' },
                { parameter: 'visibility', minValue: 5000, maxValue: 10000, severityLevel: client_1.SeverityLevel.MONITOR, actionRequired: 'Monitor visibility trends.' },
                { parameter: 'visibility', minValue: 3000, maxValue: 5000, severityLevel: client_1.SeverityLevel.CAUTION, actionRequired: 'Reduced visibility procedures.' },
                { parameter: 'visibility', minValue: 1000, maxValue: 3000, severityLevel: client_1.SeverityLevel.RESTRICTED, actionRequired: 'Low visibility operations.' },
                { parameter: 'visibility', minValue: 550, maxValue: 1000, severityLevel: client_1.SeverityLevel.SEVERE, actionRequired: 'Severe visibility restrictions.' },
                { parameter: 'wind_speed', minValue: 0, maxValue: 10, severityLevel: client_1.SeverityLevel.NORMAL, actionRequired: 'Normal operations.' },
                { parameter: 'wind_speed', minValue: 10, maxValue: 20, severityLevel: client_1.SeverityLevel.MONITOR, actionRequired: 'Monitor wind conditions.' },
                { parameter: 'wind_speed', minValue: 20, maxValue: 30, severityLevel: client_1.SeverityLevel.CAUTION, actionRequired: 'Crosswind limitations apply.' },
                { parameter: 'wind_speed', minValue: 30, maxValue: 40, severityLevel: client_1.SeverityLevel.RESTRICTED, actionRequired: 'Restricted operations.' },
                { parameter: 'wind_speed', minValue: 40, maxValue: null, severityLevel: client_1.SeverityLevel.SEVERE, actionRequired: 'Stop operations.' },
                { parameter: 'ceiling', minValue: 3000, maxValue: null, severityLevel: client_1.SeverityLevel.NORMAL, actionRequired: 'Visual approach possible.' },
                { parameter: 'ceiling', minValue: 1000, maxValue: 3000, severityLevel: client_1.SeverityLevel.MONITOR, actionRequired: 'Prepare for instrument approach.' },
                { parameter: 'ceiling', minValue: 500, maxValue: 1000, severityLevel: client_1.SeverityLevel.CAUTION, actionRequired: 'Instrument approach required.' },
                { parameter: 'ceiling', minValue: 200, maxValue: 500, severityLevel: client_1.SeverityLevel.RESTRICTED, actionRequired: 'CAT I ILS approach.' },
                { parameter: 'ceiling', minValue: 0, maxValue: 200, severityLevel: client_1.SeverityLevel.SEVERE, actionRequired: 'CAT II/III required.' },
                { parameter: 'temperature', minValue: 0, maxValue: 30, severityLevel: client_1.SeverityLevel.NORMAL, actionRequired: 'Normal temperature range.' },
                { parameter: 'temperature', minValue: 30, maxValue: 35, severityLevel: client_1.SeverityLevel.MONITOR, actionRequired: 'Monitor density altitude.' },
                { parameter: 'temperature', minValue: 35, maxValue: 40, severityLevel: client_1.SeverityLevel.CAUTION, actionRequired: 'High density altitude.' },
                { parameter: 'temperature', minValue: 40, maxValue: null, severityLevel: client_1.SeverityLevel.RESTRICTED, actionRequired: 'Severe performance limitations.' },
            ];
            const created = [];
            for (const threshold of defaultThresholds) {
                const existing = await prisma_1.prisma.threshold.findFirst({
                    where: {
                        stationId,
                        parameter: threshold.parameter,
                        minValue: threshold.minValue,
                        maxValue: threshold.maxValue,
                        severityLevel: threshold.severityLevel,
                    },
                });
                if (!existing) {
                    const t = await prisma_1.prisma.threshold.create({
                        data: {
                            ...threshold,
                            stationId,
                            severityLevel: threshold.severityLevel,
                        },
                    });
                    created.push(t);
                }
            }
            logger_1.logger.info(`Applied ${created.length} default thresholds to station ${stationId}`);
            res.json({
                success: true,
                message: `Applied ${created.length} default thresholds successfully`,
                data: created,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Apply default thresholds error:', error);
            throw new errorHandler_1.AppError('Failed to apply default thresholds', 500);
        }
    }
    static async getByParameter(req, res) {
        try {
            const { stationId, parameter } = req.params;
            const thresholds = await prisma_1.prisma.threshold.findMany({
                where: {
                    stationId,
                    parameter,
                    isActive: true,
                },
                orderBy: {
                    severityLevel: 'desc',
                },
            });
            res.json({
                success: true,
                data: thresholds,
                count: thresholds.length,
            });
        }
        catch (error) {
            logger_1.logger.error('Get thresholds by parameter error:', error);
            throw new errorHandler_1.AppError('Failed to get thresholds by parameter', 500);
        }
    }
    static async getStats(req, res) {
        try {
            const { stationId } = req.params;
            const thresholds = await prisma_1.prisma.threshold.findMany({
                where: { stationId },
            });
            const stats = {
                total: thresholds.length,
                bySeverity: {
                    NORMAL: thresholds.filter(t => t.severityLevel === client_1.SeverityLevel.NORMAL).length,
                    MONITOR: thresholds.filter(t => t.severityLevel === client_1.SeverityLevel.MONITOR).length,
                    CAUTION: thresholds.filter(t => t.severityLevel === client_1.SeverityLevel.CAUTION).length,
                    RESTRICTED: thresholds.filter(t => t.severityLevel === client_1.SeverityLevel.RESTRICTED).length,
                    SEVERE: thresholds.filter(t => t.severityLevel === client_1.SeverityLevel.SEVERE).length,
                },
                byParameter: thresholds.reduce((acc, t) => {
                    acc[t.parameter] = (acc[t.parameter] || 0) + 1;
                    return acc;
                }, {}),
                active: thresholds.filter(t => t.isActive).length,
                inactive: thresholds.filter(t => !t.isActive).length,
            };
            res.json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            logger_1.logger.error('Get threshold stats error:', error);
            throw new errorHandler_1.AppError('Failed to get threshold statistics', 500);
        }
    }
}
exports.ThresholdController = ThresholdController;
exports.default = ThresholdController;
//# sourceMappingURL=threshold.controller.js.map