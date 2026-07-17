"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const logger_1 = require("./utils/logger");
const config_1 = require("./config");
const decisionSupport_routes_1 = __importDefault(require("./routes/decisionSupport.routes"));
app_1.default.use("/api/decision-support", decisionSupport_routes_1.default);
const PORT = config_1.config.port || 5000;
const server = app_1.default.listen(PORT, () => {
    logger_1.logger.info(`🚀 Aviation Impact Dashboard Backend running on port ${PORT}`);
    logger_1.logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
    logger_1.logger.info(`🌍 Environment: ${config_1.config.nodeEnv}`);
});
const gracefulShutdown = () => {
    logger_1.logger.info('🛑 Received shutdown signal. Closing server...');
    server.close(() => {
        logger_1.logger.info('✅ Server closed successfully');
        process.exit(0);
    });
    setTimeout(() => {
        logger_1.logger.error('⚠️ Force shutdown after timeout');
        process.exit(1);
    }, 10000);
};
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
exports.default = server;
//# sourceMappingURL=server.js.map