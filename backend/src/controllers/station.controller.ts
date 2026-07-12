import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { stationSchema } from '../utils/validators';

export class StationController {
  /**
   * Create a new station
   */
  static async create(req: Request, res: Response) {
    try {
      const validatedData = stationSchema.parse(req.body);
      
      // Check if station code already exists
      const existingStation = await prisma.station.findUnique({
        where: { code: validatedData.code },
      });

      if (existingStation) {
        throw new AppError('Station code already exists', 400);
      }

      const station = await prisma.station.create({
        data: validatedData,
      });

      logger.info(`Station created: ${station.code} - ${station.name}`);

      res.status(201).json({
        success: true,
        message: 'Station created successfully',
        data: station,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Create station error:', error);
      throw new AppError('Failed to create station', 500);
    }
  }

  /**
   * Get all stations
   */
  static async getAll(req: Request, res: Response) {
    try {
      const stations = await prisma.station.findMany({
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
    } catch (error) {
      logger.error('Get stations error:', error);
      throw new AppError('Failed to get stations', 500);
    }
  }

  /**
   * Get active station
   */
  static async getActive(req: Request, res: Response) {
    try {
      const station = await prisma.station.findFirst({
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
        throw new AppError('No active station found', 404);
      }

      res.json({
        success: true,
        data: station,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get active station error:', error);
      throw new AppError('Failed to get active station', 500);
    }
  }

  /**
   * Get station by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const station = await prisma.station.findUnique({
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
        throw new AppError('Station not found', 404);
      }

      res.json({
        success: true,
        data: station,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get station error:', error);
      throw new AppError('Failed to get station', 500);
    }
  }

  /**
   * Update station
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = stationSchema.partial().parse(req.body);

      const station = await prisma.station.update({
        where: { id },
        data: validatedData,
      });

      logger.info(`Station updated: ${station.code}`);

      res.json({
        success: true,
        message: 'Station updated successfully',
        data: station,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Update station error:', error);
      throw new AppError('Failed to update station', 500);
    }
  }

  /**
   * Set active station
   */
  static async setActive(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Remove active flag from all stations
      await prisma.station.updateMany({
        data: { isActive: false },
      });

      // Set new active station
      const station = await prisma.station.update({
        where: { id },
        data: { isActive: true },
      });

      logger.info(`Active station set to: ${station.code}`);

      res.json({
        success: true,
        message: 'Active station updated successfully',
        data: station,
      });
    } catch (error) {
      logger.error('Set active station error:', error);
      throw new AppError('Failed to set active station', 500);
    }
  }

  /**
   * Delete station
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if station has related data
      const station = await prisma.station.findUnique({
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
        throw new AppError('Station not found', 404);
      }

      if (station._count.users > 0) {
        throw new AppError('Cannot delete station with associated users', 400);
      }

      // Delete station (cascade will handle related data)
      await prisma.station.delete({
        where: { id },
      });

      logger.info(`Station deleted: ${station.code}`);

      res.json({
        success: true,
        message: 'Station deleted successfully',
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Delete station error:', error);
      throw new AppError('Failed to delete station', 500);
    }
  }

  /**
   * Get station statistics
   */
  static async getStats(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const station = await prisma.station.findUnique({
        where: { id },
        include: {
          weatherData: {
            orderBy: { timestamp: 'desc' },
            take: 24,
          },
        },
      });

      if (!station) {
        throw new AppError('Station not found', 404);
      }

      const stats = {
        totalWeatherData: await prisma.weatherData.count({ where: { stationId: id } }),
        totalForecasts: await prisma.forecastData.count({ where: { stationId: id } }),
        recentWeather: station.weatherData,
        activeThresholds: await prisma.threshold.count({
          where: { stationId: id, isActive: true },
        }),
        alertsGenerated: await prisma.impactLog.count({
          where: { stationId: id },
        }),
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get station stats error:', error);
      throw new AppError('Failed to get station statistics', 500);
    }
  }
}