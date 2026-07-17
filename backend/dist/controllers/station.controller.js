"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StationController = void 0;
const prisma_1 = require("../utils/prisma");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
const validators_1 = require("../utils/validators");
class StationController {
    static async create(req, res) {
        try {
            const validatedData = validators_1.stationSchema.parse(req.body);
            const existingStation = await prisma_1.prisma.station.findUnique({
                where: { code: validatedData.code },
            });
            if (existingStation) {
                throw new errorHandler_1.AppError('Station code already exists', 400);
            }
            const station = await prisma_1.prisma.station.create({
                data: validatedData,
            });
            logger_1.logger.info(`Station created: ${station.code} - ${station.name}`);
            res.status(201).json({
                success: true,
                message: 'Station created successfully',
                data: station,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Create station error:', error);
            throw new errorHandler_1.AppError('Failed to create station', 500);
        }
    }
    static async getAll(req, res) {
        try {
            const stations = await prisma_1.prisma.station.findMany({
                include: {
                    _count: {
                        select: {
                            weatherData: true,
                            forecastData: true,
                        },
                    },
                },
                orderBy: {
                    name: 'asc',
                },
            });
            res.json({
                success: true,
                data: stations,
            });
        }
        catch (error) {
            logger_1.logger.error('Get stations error:', error);
            throw new errorHandler_1.AppError('Failed to get stations', 500);
        }
    }
    static async getActive(req, res) {
        try {
            const station = await prisma_1.prisma.station.findFirst({
                where: { isActive: true },
                include: {
                    thresholds: true,
                    weatherData: {
                        orderBy: { timestamp: 'desc' },
                        take: 1,
                    },
                },
            });
            if (!station) {
                throw new errorHandler_1.AppError('No active station found', 404);
            }
            res.json({
                success: true,
                data: station,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Get active station error:', error);
            throw new errorHandler_1.AppError('Failed to get active station', 500);
        }
    }
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const station = await prisma_1.prisma.station.findUnique({
                where: { id },
                include: {
                    thresholds: true,
                    weatherData: {
                        orderBy: { timestamp: 'desc' },
                        take: 24,
                    },
                    forecastData: {
                        orderBy: { validFrom: 'desc' },
                        take: 10,
                    },
                },
            });
            if (!station) {
                throw new errorHandler_1.AppError('Station not found', 404);
            }
            res.json({
                success: true,
                data: station,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Get station error:', error);
            throw new errorHandler_1.AppError('Failed to get station', 500);
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const validatedData = validators_1.stationSchema.partial().parse(req.body);
            const station = await prisma_1.prisma.station.update({
                where: { id },
                data: validatedData,
            });
            logger_1.logger.info(`Station updated: ${station.code}`);
            res.json({
                success: true,
                message: 'Station updated successfully',
                data: station,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Update station error:', error);
            throw new errorHandler_1.AppError('Failed to update station', 500);
        }
    }
    static async setActive(req, res) {
        try {
            const { id } = req.params;
            await prisma_1.prisma.station.updateMany({
                data: { isActive: false },
            });
            const station = await prisma_1.prisma.station.update({
                where: { id },
                data: { isActive: true },
            });
            logger_1.logger.info(`Active station set to: ${station.code}`);
            res.json({
                success: true,
                message: 'Active station updated successfully',
                data: station,
            });
        }
        catch (error) {
            logger_1.logger.error('Set active station error:', error);
            throw new errorHandler_1.AppError('Failed to set active station', 500);
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const station = await prisma_1.prisma.station.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: {
                            weatherData: true,
                            forecastData: true,
                            users: true,
                        },
                    },
                },
            });
            if (!station) {
                throw new errorHandler_1.AppError('Station not found', 404);
            }
            if (station._count.users > 0) {
                throw new errorHandler_1.AppError('Cannot delete station with associated users', 400);
            }
            await prisma_1.prisma.station.delete({
                where: { id },
            });
            logger_1.logger.info(`Station deleted: ${station.code}`);
            res.json({
                success: true,
                message: 'Station deleted successfully',
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Delete station error:', error);
            throw new errorHandler_1.AppError('Failed to delete station', 500);
        }
    }
    static async getStats(req, res) {
        try {
            const { id } = req.params;
            const station = await prisma_1.prisma.station.findUnique({
                where: { id },
                include: {
                    weatherData: {
                        orderBy: { timestamp: 'desc' },
                        take: 24,
                    },
                },
            });
            if (!station) {
                throw new errorHandler_1.AppError('Station not found', 404);
            }
            const stats = {
                totalWeatherData: await prisma_1.prisma.weatherData.count({ where: { stationId: id } }),
                totalForecasts: await prisma_1.prisma.forecastData.count({ where: { stationId: id } }),
                recentWeather: station.weatherData,
                activeThresholds: await prisma_1.prisma.threshold.count({
                    where: { stationId: id, isActive: true },
                }),
                alertsGenerated: await prisma_1.prisma.impactLog.count({
                    where: { stationId: id },
                }),
            };
            res.json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Get station stats error:', error);
            throw new errorHandler_1.AppError('Failed to get station statistics', 500);
        }
    }
}
exports.StationController = StationController;
//# sourceMappingURL=station.controller.js.map