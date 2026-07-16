"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherController = void 0;
const prisma_1 = require("../utils/prisma");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
const validators_1 = require("../utils/validators");
const weather_service_1 = require("../services/weather.service");
const csv_parse_1 = require("csv-parse");
const fs_1 = __importStar(require("fs"));
const exceljs_1 = require("exceljs");
class WeatherController {
    static async create(req, res) {
        try {
            const validatedData = validators_1.weatherSchema.parse(req.body);
            const derivedData = weather_service_1.WeatherService.calculateDerivedParameters(validatedData);
            const weatherData = await prisma_1.prisma.weatherData.create({
                data: {
                    ...validatedData,
                    ...derivedData,
                },
                include: {
                    station: true,
                },
            });
            await weather_service_1.WeatherService.checkThresholds(weatherData);
            logger_1.logger.info(`Weather data added for station: ${weatherData.stationId}`);
            res.status(201).json({
                success: true,
                message: 'Weather data added successfully',
                data: weatherData,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Create weather data error:', error);
            throw new errorHandler_1.AppError('Failed to add weather data', 500);
        }
    }
    static async getCurrent(req, res) {
        try {
            const { stationId } = req.params;
            const weather = await prisma_1.prisma.weatherData.findFirst({
                where: { stationId },
                orderBy: { timestamp: 'desc' },
                include: {
                    station: true,
                },
            });
            if (!weather) {
                throw new errorHandler_1.AppError('No weather data found for this station', 404);
            }
            res.json({
                success: true,
                data: weather,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Get current weather error:', error);
            throw new errorHandler_1.AppError('Failed to get current weather', 500);
        }
    }
    static async getHistorical(req, res) {
        try {
            const { stationId } = req.params;
            const { startDate, endDate, limit = 100 } = req.query;
            const where = { stationId };
            if (startDate) {
                where.timestamp = { gte: new Date(startDate) };
            }
            if (endDate) {
                where.timestamp = { ...where.timestamp, lte: new Date(endDate) };
            }
            const weatherData = await prisma_1.prisma.weatherData.findMany({
                where,
                orderBy: { timestamp: 'desc' },
                take: parseInt(limit, 10),
                include: {
                    station: true,
                },
            });
            res.json({
                success: true,
                data: weatherData,
                count: weatherData.length,
            });
        }
        catch (error) {
            logger_1.logger.error('Get historical weather error:', error);
            throw new errorHandler_1.AppError('Failed to get historical weather data', 500);
        }
    }
    static async getTrends(req, res) {
        try {
            const { stationId } = req.params;
            const { hours = 24 } = req.query;
            const weatherData = await prisma_1.prisma.weatherData.findMany({
                where: {
                    stationId,
                    timestamp: {
                        gte: new Date(Date.now() - parseInt(hours, 10) * 3600000),
                    },
                },
                orderBy: { timestamp: 'asc' },
            });
            const trends = weather_service_1.WeatherService.analyzeTrends(weatherData);
            res.json({
                success: true,
                data: trends,
            });
        }
        catch (error) {
            logger_1.logger.error('Get weather trends error:', error);
            throw new errorHandler_1.AppError('Failed to get weather trends', 500);
        }
    }
    static async importData(req, res) {
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
            let importedCount = 0;
            const errors = [];
            if (file.mimetype === 'text/csv') {
                const fileContent = (0, fs_1.readFileSync)(file.path, 'utf-8');
                const records = await new Promise((resolve, reject) => {
                    (0, csv_parse_1.parse)(fileContent, {
                        columns: true,
                        skip_empty_lines: true,
                    }, (err, records) => {
                        if (err)
                            reject(err);
                        else
                            resolve(records);
                    });
                });
                for (const record of records) {
                    try {
                        const weatherData = weather_service_1.WeatherService.parseCSVRecord(record);
                        const validatedData = validators_1.weatherSchema.parse({
                            ...weatherData,
                            stationId,
                        });
                        const derivedData = weather_service_1.WeatherService.calculateDerivedParameters(validatedData);
                        await prisma_1.prisma.weatherData.create({
                            data: {
                                ...validatedData,
                                ...derivedData,
                            },
                        });
                        importedCount++;
                    }
                    catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        errors.push(`Row ${importedCount + 1}: ${errorMessage}`);
                    }
                }
            }
            else if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet')) {
                const workbook = new exceljs_1.Workbook();
                await workbook.xlsx.readFile(file.path);
                const worksheet = workbook.getWorksheet(1);
                if (!worksheet) {
                    throw new errorHandler_1.AppError('No worksheet found in Excel file', 400);
                }
                const headers = worksheet.getRow(1).values;
                for (let i = 2; i <= worksheet.rowCount; i++) {
                    try {
                        const row = worksheet.getRow(i);
                        const record = {};
                        headers.forEach((header, index) => {
                            if (header) {
                                record[header.toString().trim()] = row.getCell(index + 1).value;
                            }
                        });
                        const weatherData = weather_service_1.WeatherService.parseExcelRecord(record);
                        const validatedData = validators_1.weatherSchema.parse({
                            ...weatherData,
                            stationId,
                        });
                        const derivedData = weather_service_1.WeatherService.calculateDerivedParameters(validatedData);
                        await prisma_1.prisma.weatherData.create({
                            data: {
                                ...validatedData,
                                ...derivedData,
                            },
                        });
                        importedCount++;
                    }
                    catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        errors.push(`Row ${i}: ${errorMessage}`);
                    }
                }
            }
            if (fs_1.default.existsSync(file.path)) {
                fs_1.default.unlinkSync(file.path);
            }
            logger_1.logger.info(`Imported ${importedCount} weather records for station ${station.code}`);
            res.json({
                success: true,
                message: `Successfully imported ${importedCount} records`,
                data: {
                    imported: importedCount,
                    errors,
                    totalRows: importedCount + errors.length,
                },
            });
        }
        catch (error) {
            if (req.file && fs_1.default.existsSync(req.file.path)) {
                fs_1.default.unlinkSync(req.file.path);
            }
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Import weather data error:', error);
            throw new errorHandler_1.AppError('Failed to import weather data', 500);
        }
    }
    static async getStats(req, res) {
        try {
            const { stationId } = req.params;
            const { days = 7 } = req.query;
            const startDate = new Date(Date.now() - parseInt(days, 10) * 86400000);
            const weatherData = await prisma_1.prisma.weatherData.findMany({
                where: {
                    stationId,
                    timestamp: { gte: startDate },
                },
                orderBy: { timestamp: 'asc' },
            });
            const stats = weather_service_1.WeatherService.calculateStatistics(weatherData);
            res.json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            logger_1.logger.error('Get weather stats error:', error);
            throw new errorHandler_1.AppError('Failed to get weather statistics', 500);
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const validatedData = validators_1.weatherSchema.partial().parse(req.body);
            const weatherData = await prisma_1.prisma.weatherData.update({
                where: { id },
                data: validatedData,
                include: {
                    station: true,
                },
            });
            await weather_service_1.WeatherService.checkThresholds(weatherData);
            logger_1.logger.info(`Weather data updated: ${id}`);
            res.json({
                success: true,
                message: 'Weather data updated successfully',
                data: weatherData,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Update weather data error:', error);
            throw new errorHandler_1.AppError('Failed to update weather data', 500);
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            await prisma_1.prisma.weatherData.delete({
                where: { id },
            });
            logger_1.logger.info(`Weather data deleted: ${id}`);
            res.json({
                success: true,
                message: 'Weather data deleted successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Delete weather data error:', error);
            throw new errorHandler_1.AppError('Failed to delete weather data', 500);
        }
    }
    static async getLatestAllStations(req, res) {
        try {
            const stations = await prisma_1.prisma.station.findMany({
                where: {
                    isActive: true,
                },
                include: {
                    weatherData: {
                        orderBy: {
                            timestamp: 'desc',
                        },
                        take: 1,
                    },
                },
            });
            const latest = stations.map((station) => ({
                id: station.id,
                code: station.code,
                name: station.name,
                latitude: station.latitude,
                longitude: station.longitude,
                elevation: station.elevation,
                category: station.category,
                weather: station.weatherData.length > 0
                    ? station.weatherData[0]
                    : null,
            }));
            res.json({
                success: true,
                count: latest.length,
                data: latest,
            });
        }
        catch (error) {
            logger_1.logger.error("Latest weather error:", error);
            throw new errorHandler_1.AppError("Failed to load latest weather", 500);
        }
    }
}
exports.WeatherController = WeatherController;
//# sourceMappingURL=weather.controller.js.map