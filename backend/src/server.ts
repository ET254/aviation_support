import app from './app';
import { logger } from './utils/logger';
import { config } from './config';
import decisionSupportRoutes
    from "./routes/decisionSupport.routes";

app.use(
    "/api/decision-support",
    decisionSupportRoutes
);

const PORT = config.port || 5000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Aviation Impact Dashboard Backend running on port ${PORT}`);
  logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  logger.info(`🌍 Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('🛑 Received shutdown signal. Closing server...');
  server.close(() => {
    logger.info('✅ Server closed successfully');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('⚠️ Force shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default server;