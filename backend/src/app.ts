import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';

// Routes
import authRoutes from './routes/auth.routes';
import stationRoutes from './routes/station.routes';
import weatherRoutes from './routes/weather.routes';
import forecastRoutes from './routes/forecast.routes';
import impactRoutes from './routes/impact.routes';
import thresholdRoutes from './routes/threshold.routes';
import alertRoutes from './routes/alert.routes';
import reportRoutes from './routes/report.routes';
import userRoutes from './routes/user.routes';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// CORS
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
if (config.nodeEnv === 'production') {
  app.use('/api', rateLimiter);
}
// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/impacts', impactRoutes);
app.use('/api/thresholds', thresholdRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// Swagger Documentation
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Error handler
app.use(errorHandler);

// Unhandled rejection handler
process.on('unhandledRejection', (error: Error) => {
  logger.error('Unhandled Rejection:', error);
});

export default app;