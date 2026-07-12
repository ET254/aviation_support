import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { config } from '../config';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { loginSchema, registerSchema } from '../utils/validators';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser) {
        throw new AppError('User already exists', 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.name,
          role: validatedData.role,
          stationId: validatedData.stationId,
          preferences: {},
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          stationId: true,
          createdAt: true,
        },
      });

      logger.info(`User registered: ${user.email}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Registration error:', error);
      throw new AppError('Registration failed', 500);
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: validatedData.email },
        include: {
          station: true,
        },
      });

      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      if (!user.isActive) {
        throw new AppError('Account is disabled', 403);
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      // Generate tokens
      const accessToken = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          stationId: user.stationId,
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions
      );

      logger.info(`User logged in: ${user.email}`);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            stationId: user.stationId,
            station: user.station,
            preferences: user.preferences,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Login error:', error);
      throw new AppError('Login failed', 500);
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError('Refresh token required', 400);
      }

      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { id: string };

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
          stationId: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw new AppError('User not found or inactive', 401);
      }

      const newAccessToken = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          stationId: user.stationId,
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
      );

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
        },
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Refresh token expired', 401);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid refresh token', 401);
      }
      if (error instanceof AppError) throw error;
      logger.error('Token refresh error:', error);
      throw new AppError('Token refresh failed', 500);
    }
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response) {
    // Client-side token removal - no server-side action needed with JWT
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  /**
   * Get current user
   */
  static async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        throw new AppError('Not authenticated', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          stationId: true,
          station: true,
          preferences: true,
          lastLogin: true,
          createdAt: true,
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
      logger.error('Get current user error:', error);
      throw new AppError('Failed to get user data', 500);
    }
  }

  /**
   * Change password
   */
  static async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw new AppError('Current password and new password required', 400);
      }

      if (newPassword.length < 8) {
        throw new AppError('New password must be at least 8 characters', 400);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new AppError('Current password is incorrect', 401);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      logger.info(`Password changed for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Change password error:', error);
      throw new AppError('Failed to change password', 500);
    }
  }
}