"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportSchema = exports.alertSchema = exports.forecastSchema = exports.thresholdSchema = exports.weatherSchema = exports.stationSchema = exports.changePasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    role: zod_1.z.enum([
        'ADMIN',
        'METEOROLOGIST',
        'DISPATCHER',
        'PILOT',
        'ATC',
        'OPERATIONS',
        'GROUND_HANDLER',
    ]),
    stationId: zod_1.z.string().optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(6),
    newPassword: zod_1.z.string().min(8),
});
exports.stationSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    code: zod_1.z.string().min(3, 'Code must be at least 3 characters'),
    wmoId: zod_1.z.string().optional(),
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    elevation: zod_1.z.number().min(-1000).max(30000),
    terrainType: zod_1.z.enum([
        'HIGHLANDS',
        'COASTAL',
        'LAKE_REGION',
        'SEMI_ARID',
        'VALLEY_MOUNTAIN',
        'PLAINS',
        'DESERT',
    ]),
    topographyDescription: zod_1.z.string().min(10),
    runwayLength: zod_1.z.number().optional(),
    runwayOrientation: zod_1.z.string().optional(),
    runwaySurface: zod_1.z.string().optional(),
    category: zod_1.z.enum([
        'INTERNATIONAL',
        'DOMESTIC',
        'AERODROME',
        'AIRSTRIP',
    ]),
});
exports.weatherSchema = zod_1.z.object({
    stationId: zod_1.z.string(),
    timestamp: zod_1.z.string().datetime(),
    temperature: zod_1.z.number().optional(),
    windDirection: zod_1.z.number().min(0).max(360).optional(),
    windSpeed: zod_1.z.number().min(0).optional(),
    gustSpeed: zod_1.z.number().min(0).optional(),
    visibility: zod_1.z.number().min(0).optional(),
    rvr: zod_1.z.number().min(0).optional(),
    pressureQnh: zod_1.z.number().min(800).max(1100).optional(),
    pressureQfe: zod_1.z.number().min(800).max(1100).optional(),
    humidity: zod_1.z.number().min(0).max(100).optional(),
    dewPoint: zod_1.z.number().optional(),
    cloudAmount: zod_1.z.number().min(0).max(8).optional(),
    cloudBase: zod_1.z.number().min(0).optional(),
    cloudType: zod_1.z.enum([
        'CLEAR',
        'FEW',
        'SCATTERED',
        'BROKEN',
        'OVERCAST',
        'VERTICAL_DEVELOPMENT',
    ]).optional(),
    precipitationType: zod_1.z.enum([
        'NONE',
        'RAIN',
        'SNOW',
        'SLEET',
        'HAIL',
        'FREEZING_RAIN',
    ]).optional(),
    precipitationIntensity: zod_1.z.number().min(0).optional(),
});
exports.thresholdSchema = zod_1.z.object({
    stationId: zod_1.z.string(),
    parameter: zod_1.z.string(),
    minValue: zod_1.z.number().optional(),
    maxValue: zod_1.z.number().optional(),
    severityLevel: zod_1.z.enum([
        'NORMAL',
        'MONITOR',
        'CAUTION',
        'RESTRICTED',
        'SEVERE',
        'CRITICAL',
    ]),
    actionRequired: zod_1.z.string(),
    userRole: zod_1.z.enum([
        'ADMIN',
        'METEOROLOGIST',
        'DISPATCHER',
        'PILOT',
        'ATC',
        'OPERATIONS',
        'GROUND_HANDLER',
    ]).optional(),
    isActive: zod_1.z.boolean().default(true),
});
exports.forecastSchema = zod_1.z.object({
    stationId: zod_1.z.string(),
    validFrom: zod_1.z.string().datetime(),
    validTo: zod_1.z.string().datetime(),
    taf: zod_1.z.string().optional(),
    sigmetData: zod_1.z.any().optional(),
    upperWind: zod_1.z.any().optional(),
    upperTemp: zod_1.z.any().optional(),
    freezingLevel: zod_1.z.number().optional(),
    turbulenceForecast: zod_1.z.string().optional(),
    icingForecast: zod_1.z.string().optional(),
});
exports.alertSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    type: zod_1.z.enum([
        'WEATHER',
        'OPERATIONAL',
        'SAFETY',
        'SYSTEM',
        'MAINTENANCE',
    ]),
    message: zod_1.z.string().min(1),
    severity: zod_1.z.enum([
        'NORMAL',
        'MONITOR',
        'CAUTION',
        'RESTRICTED',
        'SEVERE',
        'CRITICAL',
    ]),
    actionUrl: zod_1.z.string().optional(),
    expiresAt: zod_1.z.string().datetime().optional(),
});
exports.reportSchema = zod_1.z.object({
    stationId: zod_1.z.string(),
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
    type: zod_1.z.enum([
        'WEATHER',
        'IMPACT',
        'OPERATIONAL',
        'FORECAST',
    ]),
    format: zod_1.z.enum([
        'json',
        'pdf',
        'csv',
        'excel',
    ]).default('json'),
});
//# sourceMappingURL=validators.js.map