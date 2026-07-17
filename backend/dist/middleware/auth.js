"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireStation = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
const prisma_1 = require("../utils/prisma");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
            });
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
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
                return res.status(401).json({
                    success: false,
                    message: 'User not found or inactive',
                });
            }
            req.user = {
                id: user.id,
                email: user.email,
                role: user.role,
                stationId: user.stationId || undefined,
            };
            next();
        }
        catch (jwtError) {
            if (jwtError instanceof jsonwebtoken_1.default.TokenExpiredError) {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired',
                });
            }
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed',
        });
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
            });
        }
        next();
    };
};
exports.authorize = authorize;
const requireStation = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authenticated',
        });
    }
    const stationId = req.query.stationId || req.body.stationId;
    if (!stationId) {
        return res.status(400).json({
            success: false,
            message: 'Station ID required',
        });
    }
    if (req.user.role !== 'ADMIN' && req.user.stationId !== stationId) {
        return res.status(403).json({
            success: false,
            message: 'Access denied to this station',
        });
    }
    next();
};
exports.requireStation = requireStation;
//# sourceMappingURL=auth.js.map