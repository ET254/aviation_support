"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForecastController = void 0;
const prisma_1 = require("../utils/prisma");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
const forecast_service_1 = require("../services/forecast.service");
const netcdf_parser_1 = require("../utils/netcdf-parser");
class ForecastController {
    static async create(req, res) {
        try {
            const { stationId, validFrom, validTo, taf, sigmetData, upperWind, upperTemp, freezingLevel, turbulenceForecast, icingForecast } = req.body;
            const forecast = await prisma_1.prisma.forecastData.create({
                data: {
                    stationId,
                    validFrom: new Date(validFrom),
                    validTo: new Date(validTo),
                    taf,
                    sigmetData,
                    upperWind,
                    upperTemp,
                    freezingLevel: parseFloat(freezingLevel),
                    turbulenceForecast,
                    icingForecast,
                    source: 'MANUAL',
                },
                include: {
                    station: true,
                },
            });
            logger_1.logger.info(`Forecast created for station: ${stationId}`);
            res.status(201).json({
                success: true,
                message: 'Forecast created successfully',
                data: forecast,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Create forecast error:', error);
            throw new errorHandler_1.AppError('Failed to create forecast', 500);
        }
    }
    static async getCurrent(req, res) {
        try {
            const { stationId } = req.params;
            const now = new Date();
            const forecast = await prisma_1.prisma.forecastData.findFirst({
                where: {
                    stationId,
                    validFrom: { lte: now },
                    validTo: { gte: now },
                },
                include: {
                    station: true,
                },
            });
            if (!forecast) {
                throw new errorHandler_1.AppError('No active forecast found for this station', 404);
            }
            res.json({
                success: true,
                data: forecast,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Get current forecast error:', error);
            throw new errorHandler_1.AppError('Failed to get current forecast', 500);
        }
    }
    static async getTAF(req, res) {
        try {
            const { stationId } = req.params;
            const forecast = await prisma_1.prisma.forecastData.findFirst({
                where: {
                    stationId,
                    validFrom: { lte: new Date() },
                    validTo: { gte: new Date() },
                },
                select: {
                    taf: true,
                    validFrom: true,
                    validTo: true,
                    station: {
                        select: {
                            name: true,
                            code: true,
                        },
                    },
                },
            });
            if (!forecast) {
                throw new errorHandler_1.AppError('No TAF available for this station', 404);
            }
            res.json({
                success: true,
                data: forecast,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Get TAF error:', error);
            throw new errorHandler_1.AppError('Failed to get TAF', 500);
        }
    }
    static async getSIGMET(req, res) {
        try {
            const { stationId } = req.params;
            const now = new Date();
            const forecasts = await prisma_1.prisma.forecastData.findMany({
                where: {
                    stationId,
                    validFrom: { lte: now },
                    validTo: { gte: now },
                },
                select: {
                    sigmetData: true,
                    validFrom: true,
                    validTo: true,
                    station: {
                        select: {
                            name: true,
                            code: true,
                        },
                    },
                },
                orderBy: {
                    validFrom: 'desc',
                },
                take: 5,
            });
            const filteredForecasts = forecasts.filter(f => f.sigmetData !== null);
            res.json({
                success: true,
                data: filteredForecasts,
                count: filteredForecasts.length,
            });
        }
        catch (error) {
            logger_1.logger.error('Get SIGMET error:', error);
            throw new errorHandler_1.AppError('Failed to get SIGMET data', 500);
        }
    }
    static async importNetCDF(req, res) {
        try {
            const { stationId } = req.body;
            const file = req.file;
            if (!file) {
                throw new errorHandler_1.AppError('No file uploaded', 400);
            }
            if (!stationId) {
                throw new errorHandler_1.AppError('Station ID required', 400);
            }
            const station = await prisma_1.prisma.station.findUnique({
                where: { id: stationId },
            });
            if (!station) {
                throw new errorHandler_1.AppError('Station not found', 404);
            }
            const forecastData = await netcdf_parser_1.NetCDFParser.parseFile(file.path);
            const created = [];
            for (const data of forecastData) {
                const forecast = await prisma_1.prisma.forecastData.create({
                    data: {
                        stationId,
                        validFrom: data.validFrom,
                        validTo: data.validTo,
                        taf: data.taf,
                        sigmetData: data.sigmetData,
                        upperWind: data.upperWind,
                        upperTemp: data.upperTemp,
                        freezingLevel: data.freezingLevel,
                        turbulenceForecast: data.turbulenceForecast,
                        icingForecast: data.icingForecast,
                        source: 'NETCDF',
                        fileReference: file.filename,
                    },
                });
                created.push(forecast);
            }
            logger_1.logger.info(`Imported ${created.length} forecasts from NetCDF for station ${station.code}`);
            res.json({
                success: true,
                message: `Successfully imported ${created.length} forecasts`,
                data: created,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Import NetCDF error:', error);
            throw new errorHandler_1.AppError('Failed to import NetCDF data', 500);
        }
    }
    static async getUpperAir(req, res) {
        try {
            const { stationId } = req.params;
            const { level } = req.query;
            const forecast = await prisma_1.prisma.forecastData.findFirst({
                where: {
                    stationId,
                    validFrom: { lte: new Date() },
                    validTo: { gte: new Date() },
                },
                select: {
                    upperWind: true,
                    upperTemp: true,
                    freezingLevel: true,
                },
            });
            if (!forecast) {
                throw new errorHandler_1.AppError('No upper air data available', 404);
            }
            let upperAirData = {
                upperWind: forecast.upperWind,
                upperTemp: forecast.upperTemp,
                freezingLevel: forecast.freezingLevel,
            };
            if (level) {
                const pressureLevel = parseInt(level, 10);
            }
            res.json({
                success: true,
                data: upperAirData,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Get upper air data error:', error);
            throw new errorHandler_1.AppError('Failed to get upper air data', 500);
        }
    }
    static async getTimeline(req, res) {
        try {
            const { stationId } = req.params;
            const { hours = 24 } = req.query;
            const now = new Date();
            const endTime = new Date(now.getTime() + parseInt(hours, 10) * 3600000);
            const forecasts = await prisma_1.prisma.forecastData.findMany({
                where: {
                    stationId,
                    OR: [
                        {
                            validFrom: { gte: now, lte: endTime },
                        },
                        {
                            validTo: { gte: now, lte: endTime },
                        },
                    ],
                },
                orderBy: {
                    validFrom: 'asc',
                },
                include: {
                    station: true,
                },
            });
            const timeline = forecast_service_1.ForecastService.generateTimeline(forecasts, now, endTime);
            res.json({
                success: true,
                data: timeline,
            });
        }
        catch (error) {
            logger_1.logger.error('Get forecast timeline error:', error);
            throw new errorHandler_1.AppError('Failed to get forecast timeline', 500);
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const forecast = await prisma_1.prisma.forecastData.update({
                where: { id },
                data: {
                    ...data,
                    validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
                    validTo: data.validTo ? new Date(data.validTo) : undefined,
                },
                include: {
                    station: true,
                },
            });
            logger_1.logger.info(`Forecast updated: ${id}`);
            res.json({
                success: true,
                message: 'Forecast updated successfully',
                data: forecast,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Update forecast error:', error);
            throw new errorHandler_1.AppError('Failed to update forecast', 500);
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            await prisma_1.prisma.forecastData.delete({
                where: { id },
            });
            logger_1.logger.info(`Forecast deleted: ${id}`);
            res.json({
                success: true,
                message: 'Forecast deleted successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Delete forecast error:', error);
            throw new errorHandler_1.AppError('Failed to delete forecast', 500);
        }
    }
}
exports.ForecastController = ForecastController;
//# sourceMappingURL=forecast.controller.js.map