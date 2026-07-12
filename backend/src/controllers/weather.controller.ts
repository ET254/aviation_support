import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { weatherSchema } from '../utils/validators';
import { WeatherService } from '../services/weather.service';
import { parse } from 'csv-parse';
import fs, { readFileSync } from 'fs';
import { Workbook } from 'exceljs';

export class WeatherController {
  /**
   * Add weather data
   */
  static async create(req: Request, res: Response) {
    try {
      const validatedData = weatherSchema.parse(req.body);
      
      // Calculate derived parameters
      const derivedData = WeatherService.calculateDerivedParameters(validatedData);
      
      const weatherData = await prisma.weatherData.create({
        data: {
          ...validatedData,
          ...derivedData,
        },
        include: {
          station: true,
        },
      });

      // Check for threshold breaches
      await WeatherService.checkThresholds(weatherData);

      logger.info(`Weather data added for station: ${weatherData.stationId}`);

      res.status(201).json({
        success: true,
        message: 'Weather data added successfully',
        data: weatherData,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Create weather data error:', error);
      throw new AppError('Failed to add weather data', 500);
    }
  }

  /**
   * Get current weather for station
   */
  static async getCurrent(req: Request, res: Response) {
    try {
      const { stationId } = req.params;

      const weather = await prisma.weatherData.findFirst({
        where: { stationId },
        orderBy: { timestamp: 'desc' },
        include: {
          station: true,
        },
      });

      if (!weather) {
        throw new AppError('No weather data found for this station', 404);
      }

      res.json({
        success: true,
        data: weather,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get current weather error:', error);
      throw new AppError('Failed to get current weather', 500);
    }
  }

  /**
   * Get historical weather data
   */
  static async getHistorical(req: Request, res: Response) {
    try {
      const { stationId } = req.params;
      const { startDate, endDate, limit = 100 } = req.query;

      const where: any = { stationId };
      
      if (startDate) {
        where.timestamp = { gte: new Date(startDate as string) };
      }
      if (endDate) {
        where.timestamp = { ...where.timestamp, lte: new Date(endDate as string) };
      }

      const weatherData = await prisma.weatherData.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: parseInt(limit as string, 10),
        include: {
          station: true,
        },
      });

      res.json({
        success: true,
        data: weatherData,
        count: weatherData.length,
      });
    } catch (error) {
      logger.error('Get historical weather error:', error);
      throw new AppError('Failed to get historical weather data', 500);
    }
  }

  /**
   * Get weather trends
   */
  static async getTrends(req: Request, res: Response) {
    try {
      const { stationId } = req.params;
      const { hours = 24 } = req.query;

      const weatherData = await prisma.weatherData.findMany({
        where: {
          stationId,
          timestamp: {
            gte: new Date(Date.now() - parseInt(hours as string, 10) * 3600000),
          },
        },
        orderBy: { timestamp: 'asc' },
      });

      const trends = WeatherService.analyzeTrends(weatherData);

      res.json({
        success: true,
        data: trends,
      });
    } catch (error) {
      logger.error('Get weather trends error:', error);
      throw new AppError('Failed to get weather trends', 500);
    }
  }

  /**
   * Import weather data from CSV/Excel
   */
  static async importData(req: Request, res: Response) {
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

      let importedCount = 0;
      const errors: string[] = [];

      if (file.mimetype === 'text/csv') {
        // Parse CSV
        const fileContent = readFileSync(file.path, 'utf-8');
        const records = await new Promise<any[]>((resolve, reject) => {
          parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
          }, (err, records) => {
            if (err) reject(err);
            else resolve(records);
          });
        });

        for (const record of records) {
          try {
            const weatherData = WeatherService.parseCSVRecord(record);
            const validatedData = weatherSchema.parse({
              ...weatherData,
              stationId,
            });
            
            const derivedData = WeatherService.calculateDerivedParameters(validatedData);
            
            await prisma.weatherData.create({
              data: {
                ...validatedData,
                ...derivedData,
              },
            });
            
            importedCount++;
          } catch (error) {
            // FIX: Check if error is an instance of Error
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            errors.push(`Row ${importedCount + 1}: ${errorMessage}`);
          }
        }
      } else if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet')) {
        // Parse Excel
        const workbook = new Workbook();
        await workbook.xlsx.readFile(file.path);
        const worksheet = workbook.getWorksheet(1);
        
        if (!worksheet) {
          throw new AppError('No worksheet found in Excel file', 400);
        }

        const headers = worksheet.getRow(1).values as string[];
        
        for (let i = 2; i <= worksheet.rowCount; i++) {
          try {
            const row = worksheet.getRow(i);
            const record: any = {};
            
            headers.forEach((header, index) => {
              if (header) {
                record[header.toString().trim()] = row.getCell(index + 1).value;
              }
            });

            const weatherData = WeatherService.parseExcelRecord(record);
            const validatedData = weatherSchema.parse({
              ...weatherData,
              stationId,
            });
            
            const derivedData = WeatherService.calculateDerivedParameters(validatedData);
            
            await prisma.weatherData.create({
              data: {
                ...validatedData,
                ...derivedData,
              },
            });
            
            importedCount++;
          } catch (error) {
            // FIX: Check if error is an instance of Error
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            errors.push(`Row ${i}: ${errorMessage}`);
          }
        }
      }

      // Delete uploaded file after processing
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      logger.info(`Imported ${importedCount} weather records for station ${station.code}`);

      res.json({
        success: true,
        message: `Successfully imported ${importedCount} records`,
        data: {
          imported: importedCount,
          errors,
          totalRows: importedCount + errors.length,
        },
      });
    } catch (error) {
       if (req.file && fs.existsSync(req.file.path)) {
    fs.unlinkSync(req.file.path);
  }

  if (error instanceof AppError) throw error;

  logger.error('Import weather data error:', error);

  throw new AppError('Failed to import weather data', 500);
    }
  }

  /**
   * Get weather statistics
   */
  static async getStats(req: Request, res: Response) {
    try {
      const { stationId } = req.params;
      const { days = 7 } = req.query;

      const startDate = new Date(Date.now() - parseInt(days as string, 10) * 86400000);

      const weatherData = await prisma.weatherData.findMany({
        where: {
          stationId,
          timestamp: { gte: startDate },
        },
        orderBy: { timestamp: 'asc' },
      });

      const stats = WeatherService.calculateStatistics(weatherData);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Get weather stats error:', error);
      throw new AppError('Failed to get weather statistics', 500);
    }
  }

  /**
   * Update weather data
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = weatherSchema.partial().parse(req.body);

      const weatherData = await prisma.weatherData.update({
        where: { id },
        data: validatedData,
        include: {
          station: true,
        },
      });

      // Re-check thresholds
      await WeatherService.checkThresholds(weatherData);

      logger.info(`Weather data updated: ${id}`);

      res.json({
        success: true,
        message: 'Weather data updated successfully',
        data: weatherData,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Update weather data error:', error);
      throw new AppError('Failed to update weather data', 500);
    }
  }

  /**
   * Delete weather data
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.weatherData.delete({
        where: { id },
      });

      logger.info(`Weather data deleted: ${id}`);

      res.json({
        success: true,
        message: 'Weather data deleted successfully',
      });
    } catch (error) {
      logger.error('Delete weather data error:', error);
      throw new AppError('Failed to delete weather data', 500);
    }
  }
  /**
 * Get latest weather observation for every station
 */
static async getLatestAllStations(req: Request, res: Response) {
  try {

    const stations = await prisma.station.findMany({
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

      weather:
        station.weatherData.length > 0
          ? station.weatherData[0]
          : null,
    }));

    res.json({
      success: true,
      count: latest.length,
      data: latest,
    });

  } catch (error) {

    logger.error("Latest weather error:", error);

    throw new AppError(
      "Failed to load latest weather",
      500
    );

  }
}
}