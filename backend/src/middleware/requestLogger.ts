import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log request
  logger.info(`Incoming ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`Response ${res.statusCode} ${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      method: req.method,
      path: req.path,
      duration: `${duration}ms`,
    });
  });

  next();
};