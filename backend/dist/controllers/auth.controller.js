"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../utils/prisma");
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
const validators_1 = require("../utils/validators");
class AuthController {
    static async register(req, res) {
        try {
            const validatedData = validators_1.registerSchema.parse(req.body);
            const existingUser = await prisma_1.prisma.user.findUnique({
                where: { email: validatedData.email },
            });
            if (existingUser) {
                throw new errorHandler_1.AppError('User already exists', 400);
            }
            const hashedPassword = await bcryptjs_1.default.hash(validatedData.password, 10);
            const user = await prisma_1.prisma.user.create({
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
            logger_1.logger.info(`User registered: ${user.email}`);
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: user,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Registration error:', error);
            throw new errorHandler_1.AppError('Registration failed', 500);
        }
    }
    static async login(req, res) {
        try {
            const validatedData = validators_1.loginSchema.parse(req.body);
            const user = await prisma_1.prisma.user.findUnique({
                where: { email: validatedData.email },
                include: {
                    station: true,
                },
            });
            if (!user) {
                throw new errorHandler_1.AppError('Invalid credentials', 401);
            }
            if (!user.isActive) {
                throw new errorHandler_1.AppError('Account is disabled', 403);
            }
            const isValidPassword = await bcryptjs_1.default.compare(validatedData.password, user.password);
            if (!isValidPassword) {
                throw new errorHandler_1.AppError('Invalid credentials', 401);
            }
            await prisma_1.prisma.user.update({
                where: { id: user.id },
                data: { lastLogin: new Date() },
            });
            const accessToken = jsonwebtoken_1.default.sign({
                id: user.id,
                email: user.email,
                role: user.role,
                stationId: user.stationId,
            }, config_1.config.jwt.secret, { expiresIn: config_1.config.jwt.expiresIn });
            const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, config_1.config.jwt.refreshSecret, { expiresIn: config_1.config.jwt.refreshExpiresIn });
            logger_1.logger.info(`User logged in: ${user.email}`);
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
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Login error:', error);
            throw new errorHandler_1.AppError('Login failed', 500);
        }
    }
    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                throw new errorHandler_1.AppError('Refresh token required', 400);
            }
            const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.config.jwt.refreshSecret);
            const user = await prisma_1.prisma.user.findUnique({
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
                throw new errorHandler_1.AppError('User not found or inactive', 401);
            }
            const newAccessToken = jsonwebtoken_1.default.sign({
                id: user.id,
                email: user.email,
                role: user.role,
                stationId: user.stationId,
            }, config_1.config.jwt.secret, { expiresIn: config_1.config.jwt.expiresIn });
            res.json({
                success: true,
                data: {
                    accessToken: newAccessToken,
                },
            });
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new errorHandler_1.AppError('Refresh token expired', 401);
            }
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new errorHandler_1.AppError('Invalid refresh token', 401);
            }
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Token refresh error:', error);
            throw new errorHandler_1.AppError('Token refresh failed', 500);
        }
    }
    static async logout(req, res) {
        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    }
    static async getCurrentUser(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError('Not authenticated', 401);
            }
            const user = await prisma_1.prisma.user.findUnique({
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
                throw new errorHandler_1.AppError('User not found', 404);
            }
            res.json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Get current user error:', error);
            throw new errorHandler_1.AppError('Failed to get user data', 500);
        }
    }
    static async changePassword(req, res) {
        try {
            const userId = req.user?.id;
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                throw new errorHandler_1.AppError('Current password and new password required', 400);
            }
            if (newPassword.length < 8) {
                throw new errorHandler_1.AppError('New password must be at least 8 characters', 400);
            }
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new errorHandler_1.AppError('User not found', 404);
            }
            const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isValidPassword) {
                throw new errorHandler_1.AppError('Current password is incorrect', 401);
            }
            const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: { password: hashedPassword },
            });
            logger_1.logger.info(`Password changed for user: ${user.email}`);
            res.json({
                success: true,
                message: 'Password changed successfully',
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Change password error:', error);
            throw new errorHandler_1.AppError('Failed to change password', 500);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map