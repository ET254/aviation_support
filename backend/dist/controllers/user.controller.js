"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const prisma_1 = require("../utils/prisma");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserController {
    static async getAll(req, res) {
        try {
            const users = await prisma_1.prisma.user.findMany({
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
        }
        catch (error) {
            logger_1.logger.error('Get users error:', error);
            throw new errorHandler_1.AppError('Failed to get users', 500);
        }
    }
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const user = await prisma_1.prisma.user.findUnique({
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
            logger_1.logger.error('Get user error:', error);
            throw new errorHandler_1.AppError('Failed to get user', 500);
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, email, role, stationId, isActive, preferences } = req.body;
            const user = await prisma_1.prisma.user.findUnique({
                where: { id },
            });
            if (!user) {
                throw new errorHandler_1.AppError('User not found', 404);
            }
            if (email && email !== user.email) {
                const existing = await prisma_1.prisma.user.findUnique({
                    where: { email },
                });
                if (existing) {
                    throw new errorHandler_1.AppError('Email already in use', 400);
                }
            }
            const updated = await prisma_1.prisma.user.update({
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
            logger_1.logger.info(`User updated: ${id}`);
            res.json({
                success: true,
                message: 'User updated successfully',
                data: updated,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Update user error:', error);
            throw new errorHandler_1.AppError('Failed to update user', 500);
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const user = await prisma_1.prisma.user.findUnique({
                where: { id },
            });
            if (!user) {
                throw new errorHandler_1.AppError('User not found', 404);
            }
            if (user.role === 'ADMIN') {
                const adminCount = await prisma_1.prisma.user.count({
                    where: { role: 'ADMIN' },
                });
                if (adminCount <= 1) {
                    throw new errorHandler_1.AppError('Cannot delete the last admin user', 400);
                }
            }
            await prisma_1.prisma.user.delete({
                where: { id },
            });
            logger_1.logger.info(`User deleted: ${id}`);
            res.json({
                success: true,
                message: 'User deleted successfully',
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Delete user error:', error);
            throw new errorHandler_1.AppError('Failed to delete user', 500);
        }
    }
    static async resetPassword(req, res) {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;
            if (!newPassword || newPassword.length < 8) {
                throw new errorHandler_1.AppError('Password must be at least 8 characters', 400);
            }
            const user = await prisma_1.prisma.user.findUnique({
                where: { id },
            });
            if (!user) {
                throw new errorHandler_1.AppError('User not found', 404);
            }
            const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
            await prisma_1.prisma.user.update({
                where: { id },
                data: { password: hashedPassword },
            });
            logger_1.logger.info(`Password reset for user: ${id}`);
            res.json({
                success: true,
                message: 'Password reset successfully',
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            logger_1.logger.error('Reset password error:', error);
            throw new errorHandler_1.AppError('Failed to reset password', 500);
        }
    }
    static async updatePreferences(req, res) {
        try {
            const userId = req.user.id;
            const { preferences } = req.body;
            const user = await prisma_1.prisma.user.update({
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
        }
        catch (error) {
            logger_1.logger.error('Update preferences error:', error);
            throw new errorHandler_1.AppError('Failed to update preferences', 500);
        }
    }
    static async getStats(req, res) {
        try {
            const total = await prisma_1.prisma.user.count();
            const byRole = await prisma_1.prisma.user.groupBy({
                by: ['role'],
                _count: {
                    role: true,
                },
            });
            const active = await prisma_1.prisma.user.count({
                where: { isActive: true },
            });
            const recentLogins = await prisma_1.prisma.user.count({
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
        }
        catch (error) {
            logger_1.logger.error('Get user stats error:', error);
            throw new errorHandler_1.AppError('Failed to get user statistics', 500);
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map