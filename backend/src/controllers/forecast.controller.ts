import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { ForecastService } from '../services/forecast.service';
import { NetCDFParser } from '../utils/netcdf-parser';

export class ForecastController {
  /**
   * Create forecast
   */
  static async create(req: Request, res: Response) {
    try {
      const { stationId, validFrom, validTo, taf, sigmetData, upperWind, upperTemp, freezingLevel, turbulenceForecast, icingForecast } = req.body;

      const forecast = await prisma.forecastData.create({
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

      logger.info(`Forecast created for station: ${stationId}`);

      res.status(201).json({
        success: true,
        message: 'Forecast created successfully',
        data: forecast,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Create forecast error:', error);
      throw new AppError('Failed to create forecast', 500);
    }
  }

  /**
   * Get current forecast
   */
  static async getCurrent(req: Request, res: Response) {
    try {
      const { stationId } = req.params;
      const now = new Date();

      const forecast = await prisma.forecastData.findFirst({
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
        throw new AppError('No active forecast found for this station', 404);
      }

      res.json({
        success: true,
        data: forecast,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get current forecast error:', error);
      throw new AppError('Failed to get current forecast', 500);
    }
  }

  /**
   * Get TAF
   */
  static async getTAF(req: Request, res: Response) {
    try {
      const { stationId } = req.params;

      const forecast = await prisma.forecastData.findFirst({
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
        throw new AppError('No TAF available for this station', 404);
      }

      res.json({
        success: true,
        data: forecast,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get TAF error:', error);
      throw new AppError('Failed to get TAF', 500);
    }
  }

  /**
   * Get SIGMET - FIXED VERSION
   */
  static async getSIGMET(req: Request, res: Response) {
    try {
      const { stationId } = req.params;
      const now = new Date();

      // Get forecasts first without JSON filtering
      const forecasts = await prisma.forecastData.findMany({
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

      // Filter out null sigmetData in JavaScript
      const filteredForecasts = forecasts.filter(f => f.sigmetData !== null);

      res.json({
        success: true,
        data: filteredForecasts,
        count: filteredForecasts.length,
      });
    } catch (error) {
      logger.error('Get SIGMET error:', error);
      throw new AppError('Failed to get SIGMET data', 500);
    }
  }

  /**
   * Import NetCDF forecast data
   */
  static async importNetCDF(req: Request, res: Response) {
    try {
      const { stationId } = req.body;
      const file = req.file;

      if (!file) {
        throw new AppError('No file uploaded', 400);
      }

      if (!stationId) {
        throw new AppError('Station ID required', 400);
      }

      // Check station exists
      const station = await prisma.station.findUnique({
        where: { id: stationId },
      });

      if (!station) {
        throw new AppError('Station not found', 404);
      }

      // Parse NetCDF file
      const forecastData = await NetCDFParser.parseFile(file.path);

      // Create forecast records
      const created = [];
      for (const data of forecastData) {
        const forecast = await prisma.forecastData.create({
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

      logger.info(`Imported ${created.length} forecasts from NetCDF for station ${station.code}`);

      res.json({
        success: true,
        message: `Successfully imported ${created.length} forecasts`,
        data: created,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Import NetCDF error:', error);
      throw new AppError('Failed to import NetCDF data', 500);
    }
  }

  /**
   * Get upper air data
   */
  static async getUpperAir(req: Request, res: Response) {
    try {
      const { stationId } = req.params;
      const { level } = req.query;

      const forecast = await prisma.forecastData.findFirst({
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
        throw new AppError('No upper air data available', 404);
      }

      // Filter by pressure level if specified
      let upperAirData = {
        upperWind: forecast.upperWind,
        upperTemp: forecast.upperTemp,
        freezingLevel: forecast.freezingLevel,
      };

      if (level) {
        const pressureLevel = parseInt(level as string, 10);
        // Filter data for specific pressure level
        // Implementation depends on data structure
      }

      res.json({
        success: true,
        data: upperAirData,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get upper air data error:', error);
      throw new AppError('Failed to get upper air data', 500);
    }
  }

  /**
   * Get forecast timeline
   */
  static async getTimeline(req: Request, res: Response) {
    try {
      const { stationId } = req.params;
      const { hours = 24 } = req.query;

      const now = new Date();
      const endTime = new Date(now.getTime() + parseInt(hours as string, 10) * 3600000);

      const forecasts = await prisma.forecastData.findMany({
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

      // Generate timeline points
      const timeline = ForecastService.generateTimeline(forecasts, now, endTime);

      res.json({
        success: true,
        data: timeline,
      });
    } catch (error) {
      logger.error('Get forecast timeline error:', error);
      throw new AppError('Failed to get forecast timeline', 500);
    }
  }

  /**
   * Update forecast
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      const forecast = await prisma.forecastData.update({
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

      logger.info(`Forecast updated: ${id}`);

      res.json({
        success: true,
        message: 'Forecast updated successfully',
        data: forecast,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Update forecast error:', error);
      throw new AppError('Failed to update forecast', 500);
    }
  }

  /**
   * Delete forecast
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.forecastData.delete({
        where: { id },
      });

      logger.info(`Forecast deleted: ${id}`);

      res.json({
        success: true,
        message: 'Forecast deleted successfully',
      });
    } catch (error) {
      logger.error('Delete forecast error:', error);
      throw new AppError('Failed to delete forecast', 500);
    }
  }
}