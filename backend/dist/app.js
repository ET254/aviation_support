"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("./config");
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
const rateLimiter_1 = require("./middleware/rateLimiter");
const logger_1 = require("./utils/logger");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const station_routes_1 = __importDefault(require("./routes/station.routes"));
const weather_routes_1 = __importDefault(require("./routes/weather.routes"));
const forecast_routes_1 = __importDefault(require("./routes/forecast.routes"));
const impact_routes_1 = __importDefault(require("./routes/impact.routes"));
const threshold_routes_1 = __importDefault(require("./routes/threshold.routes"));
const alert_routes_1 = __importDefault(require("./routes/alert.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
        },
    },
}));
app.use((0, cors_1.default)({
    origin: config_1.config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
if (config_1.config.nodeEnv === 'production') {
    app.use('/api', rateLimiter_1.rateLimiter);
}
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger_1.requestLogger);
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/stations', station_routes_1.default);
app.use('/api/weather', weather_routes_1.default);
app.use('/api/forecast', forecast_routes_1.default);
app.use('/api/impacts', impact_routes_1.default);
app.use('/api/thresholds', threshold_routes_1.default);
app.use('/api/alerts', alert_routes_1.default);
app.use('/api/reports', report_routes_1.default);
app.use('/api/users', user_routes_1.default);
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path,
    });
});
app.use(errorHandler_1.errorHandler);
process.on('unhandledRejection', (error) => {
    logger_1.logger.error('Unhandled Rejection:', error);
});
exports.default = app;
//# sourceMappingURL=app.js.map