import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { ImpactService } from '../services/impact.service';

export class ImpactController {
  /**
   * Generate impact assessment
   */
  static async generate(req: Request, res: Response) {
    try {
      const { stationId, role } = req.query;

      if (!stationId) {
        throw new AppError('Station ID required', 400);
      }

      // Get current weather data
      const weather = await prisma.weatherData.findFirst({
        where: { stationId: stationId as string },
        orderBy: { timestamp: 'desc' },
        include: {
          station: true,
        },
      });

      if (!weather) {
        throw new AppError('No weather data available for this station', 404);
      }

      // Get thresholds for station
      const thresholds = await prisma.threshold.findMany({
        where: {
          stationId: stationId as string,
          isActive: true,
          ...(role && { userRole: role as any }),
        },
      });

      // Generate impact assessment
      const impact = ImpactService.assessImpact(weather, thresholds, role as string || undefined);

      // Log impact
      await prisma.impactLog.create({
        data: {
          userId: (req as any).user.id,
          stationId: stationId as string,
          eventType: 'WEATHER',
          severity: impact.overallSeverity,
          description: impact.summary,
          metadata: impact as any,
        },
      });

      res.json({
        success: true,
        data: impact,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Generate impact error:', error);
      throw new AppError('Failed to generate impact assessment', 500);
    }
  }

  /**
   * Get impacts by role
   */
  static async getByRole(req: Request, res: Response) {
    try {
      const { role } = req.params;
      const { stationId } = req.query;

      if (!stationId) {
        throw new AppError('Station ID required', 400);
      }

      const impacts = await ImpactService.getImpactsByRole(
        stationId as string,
        role as string
      );

      res.json({
        success: true,
        data: impacts,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get impacts by role error:', error);
      throw new AppError('Failed to get impacts by role', 500);
    }
  }

  /**
   * Get all impact logs
   */
  static async getLogs(req: Request, res: Response) {
    try {
      const { stationId, userId, severity, startDate, endDate, limit = 50 } = req.query;

      const where: any = {};
      
      if (stationId) where.stationId = stationId;
      if (userId) where.userId = userId;
      if (severity) where.severity = severity;
      if (startDate) where.timestamp = { gte: new Date(startDate as string) };
      if (endDate) where.timestamp = { ...where.timestamp, lte: new Date(endDate as string) };

      const logs = await prisma.impactLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: parseInt(limit as string, 10),
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
    } catch (error) {
      logger.error('Get impact logs error:', error);
      throw new AppError('Failed to get impact logs', 500);
    }
  }

  /**
   * Get impact statistics
   */
  static async getStats(req: Request, res: Response) {
    try {
      const { stationId } = req.params;
      const { days = 7 } = req.query;

      const startDate = new Date(Date.now() - parseInt(days as string, 10) * 86400000);

      const stats = await prisma.impactLog.groupBy({
        by: ['severity'],
        where: {
          stationId,
          timestamp: { gte: startDate },
        },
        _count: {
          severity: true,
        },
      });

      const total = await prisma.impactLog.count({
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
    } catch (error) {
      logger.error('Get impact stats error:', error);
      throw new AppError('Failed to get impact statistics', 500);
    }
  }

  /**
   * Acknowledge impact
   */
  static async acknowledge(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const impact = await prisma.impactLog.update({
        where: { id },
        data: {
          isResolved: true,
          resolvedAt: new Date(),
          actionTaken: req.body.actionTaken || 'Acknowledged',
        },
      });

      logger.info(`Impact acknowledged: ${id}`);

      res.json({
        success: true,
        message: 'Impact acknowledged successfully',
        data: impact,
      });
    } catch (error) {
      logger.error('Acknowledge impact error:', error);
      throw new AppError('Failed to acknowledge impact', 500);
    }
  }

  /**
   * Get decision support ladder
   */
  static async getDecisionLadder(req: Request, res: Response) {
    try {
      const { stationId } = req.params;
      const { role } = req.query;

      if (!stationId) {
        throw new AppError('Station ID required', 400);
      }

      const ladder = await ImpactService.getDecisionLadder(
        stationId,
        role as string || undefined
      );

      res.json({
        success: true,
        data: ladder,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get decision ladder error:', error);
      throw new AppError('Failed to get decision ladder', 500);
    }
  }

  /**
   * Get action recommendations
   */
  static async getActions(req: Request, res: Response) {
    try {
      const { stationId } = req.params;
      const { role } = req.query;

      if (!stationId) {
        throw new AppError('Station ID required', 400);
      }

      const actions = await ImpactService.getActionRecommendations(
        stationId,
        role as string || undefined
      );

      res.json({
        success: true,
        data: actions,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get actions error:', error);
      throw new AppError('Failed to get action recommendations', 500);
    }
  }
}