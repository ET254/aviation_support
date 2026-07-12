import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { AlertService } from '../services/alert.service';

export class AlertController {
  /**
   * Get all alerts for user
   */
  static async getAlerts(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { read, limit = 50, offset = 0 } = req.query;

      const where: any = { userId };
      
      if (read !== undefined) {
        where.readStatus = read === 'true';
      }

      const alerts = await prisma.alert.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: parseInt(limit as string, 10),
        skip: parseInt(offset as string, 10),
      });

      const total = await prisma.alert.count({ where });

      res.json({
        success: true,
        data: alerts,
        pagination: {
          total,
          limit: parseInt(limit as string, 10),
          offset: parseInt(offset as string, 10),
        },
      });
    } catch (error) {
      logger.error('Get alerts error:', error);
      throw new AppError('Failed to get alerts', 500);
    }
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const count = await prisma.alert.count({
        where: {
          userId,
          readStatus: false,
        },
      });

      res.json({
        success: true,
        data: { unread: count },
      });
    } catch (error) {
      logger.error('Get unread count error:', error);
      throw new AppError('Failed to get unread count', 500);
    }
  }

  /**
   * Mark alert as read
   */
  static async markRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const alert = await prisma.alert.findFirst({
        where: { id, userId },
      });

      if (!alert) {
        throw new AppError('Alert not found', 404);
      }

      const updated = await prisma.alert.update({
        where: { id },
        data: { readStatus: true },
      });

      res.json({
        success: true,
        message: 'Alert marked as read',
        data: updated,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Mark alert read error:', error);
      throw new AppError('Failed to mark alert as read', 500);
    }
  }

  /**
   * Mark all alerts as read
   */
  static async markAllRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      await prisma.alert.updateMany({
        where: {
          userId,
          readStatus: false,
        },
        data: { readStatus: true },
      });

      res.json({
        success: true,
        message: 'All alerts marked as read',
      });
    } catch (error) {
      logger.error('Mark all alerts read error:', error);
      throw new AppError('Failed to mark all alerts as read', 500);
    }
  }

  /**
   * Acknowledge alert
   */
  static async acknowledge(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const alert = await prisma.alert.findFirst({
        where: { id, userId },
      });

      if (!alert) {
        throw new AppError('Alert not found', 404);
      }

      const updated = await prisma.alert.update({
        where: { id },
        data: {
          readStatus: true,
          acknowledgedAt: new Date(),
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'ACKNOWLEDGE_ALERT',
          entity: 'Alert',
          entityId: id,
          changes: { acknowledged: true },
        },
      });

      res.json({
        success: true,
        message: 'Alert acknowledged',
        data: updated,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Acknowledge alert error:', error);
      throw new AppError('Failed to acknowledge alert', 500);
    }
  }

  /**
   * Create system alert
   */
  static async createAlert(req: Request, res: Response) {
    try {
      const { userId, type, message, severity, actionUrl, expiresAt } = req.body;

      const alert = await prisma.alert.create({
        data: {
          userId,
          type,
          message,
          severity,
          actionUrl,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        },
      });

      logger.info(`Alert created for user ${userId}: ${type}`);

      // Send real-time notification if WebSocket is enabled
      await AlertService.sendNotification(alert);

      res.status(201).json({
        success: true,
        message: 'Alert created successfully',
        data: alert,
      });
    } catch (error) {
      logger.error('Create alert error:', error);
      throw new AppError('Failed to create alert', 500);
    }
  }

  /**
   * Delete alert
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      // Only allow deletion if user owns the alert or is admin
      const alert = await prisma.alert.findFirst({
        where: {
          id,
          OR: [
            { userId },
            { user: { role: 'ADMIN' } },
          ],
        },
      });

      if (!alert) {
        throw new AppError('Alert not found or unauthorized', 404);
      }

      await prisma.alert.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Alert deleted successfully',
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Delete alert error:', error);
      throw new AppError('Failed to delete alert', 500);
    }
  }

  /**
   * Get alert by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const alert = await prisma.alert.findFirst({
        where: {
          id,
          OR: [
            { userId },
            { user: { role: 'ADMIN' } },
          ],
        },
      });

      if (!alert) {
        throw new AppError('Alert not found', 404);
      }

      res.json({
        success: true,
        data: alert,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get alert error:', error);
      throw new AppError('Failed to get alert', 500);
    }
  }
}