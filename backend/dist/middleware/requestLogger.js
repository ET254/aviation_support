"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_1 = require("../utils/logger");
const requestLogger = (req, res, next) => {
    const start = Date.now();
    logger_1.logger.info(`Incoming ${req.method} ${req.path}`, {
        method: req.method,
        path: req.path,
        query: req.query,
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger_1.logger.info(`Response ${res.statusCode} ${req.method} ${req.path}`, {
            statusCode: res.statusCode,
            method: req.method,
            path: req.path,
            duration: `${duration}ms`,
        });
    });
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=requestLogger.js.map