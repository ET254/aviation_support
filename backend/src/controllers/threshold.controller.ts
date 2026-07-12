import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { thresholdSchema } from '../utils/validators';
import { SeverityLevel } from "@prisma/client";

export class ThresholdController {
  /**
   * Create threshold
   */
  static async create(req: Request, res: Response) {
    try {
      const validatedData = thresholdSchema.parse(req.body);

      // Check if threshold exists for this station, parameter, and role
      const existing = await prisma.threshold.findFirst({
        where: {
          stationId: validatedData.stationId,
          parameter: validatedData.parameter,
          userRole: validatedData.userRole || null,
        },
      });

      if (existing) {
        throw new AppError('Threshold already exists for this station and parameter', 400);
      }

      // FIX: Ensure severityLevel is properly typed
      const threshold = await prisma.threshold.create({
        data: {
          ...validatedData,
          severityLevel: validatedData.severityLevel as SeverityLevel,
        },
        include: {
          station: true,
        },
      });

      logger.info(`Threshold created for station: ${threshold.stationId}`);

      res.status(201).json({
        success: true,
        message: 'Threshold created successfully',
        data: threshold,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Create threshold error:', error);
      throw new AppError('Failed to create threshold', 500);
    }
  }

  /**
   * Get all thresholds for station
   */
  static async getByStation(req: Request, res: Response) {
    try {
      const { stationId } = req.params;

      const thresholds = await prisma.threshold.findMany({
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
    } catch (error) {
      logger.error('Get thresholds error:', error);
      throw new AppError('Failed to get thresholds', 500);
    }
  }

  /**
   * Get thresholds by role
   */
  static async getByRole(req: Request, res: Response) {
    try {
      const { stationId, role } = req.params;

      const thresholds = await prisma.threshold.findMany({
        where: {
          stationId,
          OR: [
            { userRole: role as any },
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
    } catch (error) {
      logger.error('Get thresholds by role error:', error);
      throw new AppError('Failed to get thresholds by role', 500);
    }
  }

  /**
   * Update threshold
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = thresholdSchema.partial().parse(req.body);

      // FIX: Ensure severityLevel is properly typed if present
      const updateData: any = { ...validatedData };
      if (validatedData.severityLevel) {
        updateData.severityLevel = validatedData.severityLevel as SeverityLevel;
      }

      const threshold = await prisma.threshold.update({
        where: { id },
        data: updateData,
        include: {
          station: true,
        },
      });

      logger.info(`Threshold updated: ${id}`);

      res.json({
        success: true,
        message: 'Threshold updated successfully',
        data: threshold,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Update threshold error:', error);
      throw new AppError('Failed to update threshold', 500);
    }
  }

  /**
   * Toggle threshold active status
   */
  static async toggleActive(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const threshold = await prisma.threshold.findUnique({
        where: { id },
      });

      if (!threshold) {
        throw new AppError('Threshold not found', 404);
      }

      const updated = await prisma.threshold.update({
        where: { id },
        data: { isActive: !threshold.isActive },
      });

      logger.info(`Threshold ${id} active status toggled to: ${updated.isActive}`);

      res.json({
        success: true,
        message: `Threshold ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
        data: updated,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Toggle threshold error:', error);
      throw new AppError('Failed to toggle threshold', 500);
    }
  }

  /**
   * Delete threshold
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.threshold.delete({
        where: { id },
      });

      logger.info(`Threshold deleted: ${id}`);

      res.json({
        success: true,
        message: 'Threshold deleted successfully',
      });
    } catch (error) {
      logger.error('Delete threshold error:', error);
      throw new AppError('Failed to delete threshold', 500);
    }
  }

  /**
   * Apply default thresholds to station - FIXED VERSION
   */
  static async applyDefaults(req: Request, res: Response) {
    try {
      const { stationId } = req.params;

      // Check if station exists
      const station = await prisma.station.findUnique({
        where: { id: stationId },
      });

      if (!station) {
        throw new AppError('Station not found', 404);
      }

      // FIX: Use SeverityLevel enum instead of strings
      const defaultThresholds = [
        { parameter: 'visibility', minValue: 10000, maxValue: null, severityLevel: SeverityLevel.NORMAL, actionRequired: 'Normal operations continue.' },
        { parameter: 'visibility', minValue: 5000, maxValue: 10000, severityLevel: SeverityLevel.MONITOR, actionRequired: 'Monitor visibility trends.' },
        { parameter: 'visibility', minValue: 3000, maxValue: 5000, severityLevel: SeverityLevel.CAUTION, actionRequired: 'Reduced visibility procedures.' },
        { parameter: 'visibility', minValue: 1000, maxValue: 3000, severityLevel: SeverityLevel.RESTRICTED, actionRequired: 'Low visibility operations.' },
        { parameter: 'visibility', minValue: 550, maxValue: 1000, severityLevel: SeverityLevel.SEVERE, actionRequired: 'Severe visibility restrictions.' },
        { parameter: 'wind_speed', minValue: 0, maxValue: 10, severityLevel: SeverityLevel.NORMAL, actionRequired: 'Normal operations.' },
        { parameter: 'wind_speed', minValue: 10, maxValue: 20, severityLevel: SeverityLevel.MONITOR, actionRequired: 'Monitor wind conditions.' },
        { parameter: 'wind_speed', minValue: 20, maxValue: 30, severityLevel: SeverityLevel.CAUTION, actionRequired: 'Crosswind limitations apply.' },
        { parameter: 'wind_speed', minValue: 30, maxValue: 40, severityLevel: SeverityLevel.RESTRICTED, actionRequired: 'Restricted operations.' },
        { parameter: 'wind_speed', minValue: 40, maxValue: null, severityLevel: SeverityLevel.SEVERE, actionRequired: 'Stop operations.' },
        { parameter: 'ceiling', minValue: 3000, maxValue: null, severityLevel: SeverityLevel.NORMAL, actionRequired: 'Visual approach possible.' },
        { parameter: 'ceiling', minValue: 1000, maxValue: 3000, severityLevel: SeverityLevel.MONITOR, actionRequired: 'Prepare for instrument approach.' },
        { parameter: 'ceiling', minValue: 500, maxValue: 1000, severityLevel: SeverityLevel.CAUTION, actionRequired: 'Instrument approach required.' },
        { parameter: 'ceiling', minValue: 200, maxValue: 500, severityLevel: SeverityLevel.RESTRICTED, actionRequired: 'CAT I ILS approach.' },
        { parameter: 'ceiling', minValue: 0, maxValue: 200, severityLevel: SeverityLevel.SEVERE, actionRequired: 'CAT II/III required.' },
        { parameter: 'temperature', minValue: 0, maxValue: 30, severityLevel: SeverityLevel.NORMAL, actionRequired: 'Normal temperature range.' },
        { parameter: 'temperature', minValue: 30, maxValue: 35, severityLevel: SeverityLevel.MONITOR, actionRequired: 'Monitor density altitude.' },
        { parameter: 'temperature', minValue: 35, maxValue: 40, severityLevel: SeverityLevel.CAUTION, actionRequired: 'High density altitude.' },
        { parameter: 'temperature', minValue: 40, maxValue: null, severityLevel: SeverityLevel.RESTRICTED, actionRequired: 'Severe performance limitations.' },
      ];

      const created = [];
      for (const threshold of defaultThresholds) {
        const existing = await prisma.threshold.findFirst({
          where: {
            stationId,
            parameter: threshold.parameter,
            minValue: threshold.minValue,
            maxValue: threshold.maxValue,
            severityLevel: threshold.severityLevel,
          },
        });

        if (!existing) {
          const t = await prisma.threshold.create({
            data: {
              ...threshold,
              stationId,
              // FIX: Ensure severityLevel is properly typed
              severityLevel: threshold.severityLevel as SeverityLevel,
            },
          });
          created.push(t);
        }
      }

      logger.info(`Applied ${created.length} default thresholds to station ${stationId}`);

      res.json({
        success: true,
        message: `Applied ${created.length} default thresholds successfully`,
        data: created,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Apply default thresholds error:', error);
      throw new AppError('Failed to apply default thresholds', 500);
    }
  }

  /**
   * Get thresholds by parameter
   */
  static async getByParameter(req: Request, res: Response) {
    try {
      const { stationId, parameter } = req.params;

      const thresholds = await prisma.threshold.findMany({
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
    } catch (error) {
      logger.error('Get thresholds by parameter error:', error);
      throw new AppError('Failed to get thresholds by parameter', 500);
    }
  }

  /**
   * Get threshold statistics
   */
  static async getStats(req: Request, res: Response) {
    try {
      const { stationId } = req.params;

      const thresholds = await prisma.threshold.findMany({
        where: { stationId },
      });

      const stats = {
        total: thresholds.length,
        bySeverity: {
          NORMAL: thresholds.filter(t => t.severityLevel === SeverityLevel.NORMAL).length,
          MONITOR: thresholds.filter(t => t.severityLevel === SeverityLevel.MONITOR).length,
          CAUTION: thresholds.filter(t => t.severityLevel === SeverityLevel.CAUTION).length,
          RESTRICTED: thresholds.filter(t => t.severityLevel === SeverityLevel.RESTRICTED).length,
          SEVERE: thresholds.filter(t => t.severityLevel === SeverityLevel.SEVERE).length,
        },
        byParameter: thresholds.reduce((acc: any, t) => {
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
    } catch (error) {
      logger.error('Get threshold stats error:', error);
      throw new AppError('Failed to get threshold statistics', 500);
    }
  }
}

export default ThresholdController;