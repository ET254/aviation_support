import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import bcrypt from 'bcryptjs';

export class UserController {
  /**
   * Get all users
   */
  static async getAll(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          stationId: true,
          station: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          isActive: true,
          lastLogin: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      logger.error('Get users error:', error);
      throw new AppError('Failed to get users', 500);
    }
  }

  /**
   * Get user by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          stationId: true,
          station: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          isActive: true,
          preferences: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get user error:', error);
      throw new AppError('Failed to get user', 500);
    }
  }

  /**
   * Update user
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, email, role, stationId, isActive, preferences } = req.body;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Check email uniqueness
      if (email && email !== user.email) {
        const existing = await prisma.user.findUnique({
          where: { email },
        });
        if (existing) {
          throw new AppError('Email already in use', 400);
        }
      }

      const updated = await prisma.user.update({
        where: { id },
        data: {
          name,
          email,
          role,
          stationId,
          isActive,
          preferences: preferences ? JSON.parse(preferences) : undefined,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          stationId: true,
          station: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          isActive: true,
          preferences: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      logger.info(`User updated: ${id}`);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: updated,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Update user error:', error);
      throw new AppError('Failed to update user', 500);
    }
  }

  /**
   * Delete user
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Check if user is admin (prevent deleting last admin)
      if (user.role === 'ADMIN') {
        const adminCount = await prisma.user.count({
          where: { role: 'ADMIN' },
        });
        if (adminCount <= 1) {
          throw new AppError('Cannot delete the last admin user', 400);
        }
      }

      await prisma.user.delete({
        where: { id },
      });

      logger.info(`User deleted: ${id}`);

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Delete user error:', error);
      throw new AppError('Failed to delete user', 500);
    }
  }

  /**
   * Reset user password
   */
  static async resetPassword(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 8) {
        throw new AppError('Password must be at least 8 characters', 400);
      }

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
      });

      logger.info(`Password reset for user: ${id}`);

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Reset password error:', error);
      throw new AppError('Failed to reset password', 500);
    }
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { preferences } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: { 
          preferences: preferences,
        },
        select: {
          id: true,
          preferences: true,
        },
      });

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        data: user,
      });
    } catch (error) {
      logger.error('Update preferences error:', error);
      throw new AppError('Failed to update preferences', 500);
    }
  }

  /**
   * Get user statistics
   */
  static async getStats(req: Request, res: Response) {
    try {
      const total = await prisma.user.count();
      const byRole = await prisma.user.groupBy({
        by: ['role'],
        _count: {
          role: true,
        },
      });

      const active = await prisma.user.count({
        where: { isActive: true },
      });

      const recentLogins = await prisma.user.count({
        where: {
          lastLogin: {
            gte: new Date(Date.now() - 7 * 86400000),
          },
        },
      });

      res.json({
        success: true,
        data: {
          total,
          active,
          recentLogins,
          byRole: byRole.map(r => ({
            role: r.role,
            count: r._count.role,
          })),
        },
      });
    } catch (error) {
      logger.error('Get user stats error:', error);
      throw new AppError('Failed to get user statistics', 500);
    }
  }
}