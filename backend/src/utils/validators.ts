import { z } from 'zod';

/**
 * =========================
 * AUTH VALIDATION SCHEMAS
 * =========================
 */

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum([
    'ADMIN',
    'METEOROLOGIST',
    'DISPATCHER',
    'PILOT',
    'ATC',
    'OPERATIONS',
    'GROUND_HANDLER',
  ]),
  stationId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8),
});

/**
 * =========================
 * STATION VALIDATION
 * =========================
 */

export const stationSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    code: z.string().min(3, 'Code must be at least 3 characters'),
    wmoId: z.string().optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    elevation: z.number().min(-1000).max(30000),

    terrainType: z.enum([
      'HIGHLANDS',
      'COASTAL',
      'LAKE_REGION',
      'SEMI_ARID',
      'VALLEY_MOUNTAIN',
      'PLAINS',
      'DESERT',
    ]),

    topographyDescription: z.string().min(10),

    runwayLength: z.number().optional(),
    runwayOrientation: z.string().optional(),
    runwaySurface: z.string().optional(),

    category: z.enum([
      'INTERNATIONAL',
      'DOMESTIC',
      'AERODROME',
      'AIRSTRIP',
    ]),
  });


/**
 * =========================
 * WEATHER DATA
 * =========================
 */

export const weatherSchema = z.object({
    stationId: z.string(),

    timestamp: z.string().datetime(),

    temperature: z.number().optional(),

    windDirection: z.number().min(0).max(360).optional(),
    windSpeed: z.number().min(0).optional(),
    gustSpeed: z.number().min(0).optional(),

    visibility: z.number().min(0).optional(),
    rvr: z.number().min(0).optional(),

    pressureQnh: z.number().min(800).max(1100).optional(),
    pressureQfe: z.number().min(800).max(1100).optional(),

    humidity: z.number().min(0).max(100).optional(),
    dewPoint: z.number().optional(),

    cloudAmount: z.number().min(0).max(8).optional(),
    cloudBase: z.number().min(0).optional(),

    cloudType: z.enum([
      'CLEAR',
      'FEW',
      'SCATTERED',
      'BROKEN',
      'OVERCAST',
      'VERTICAL_DEVELOPMENT',
    ]).optional(),

    precipitationType: z.enum([
      'NONE',
      'RAIN',
      'SNOW',
      'SLEET',
      'HAIL',
      'FREEZING_RAIN',
    ]).optional(),

    precipitationIntensity: z.number().min(0).optional(),
});

/**
 * =========================
 * THRESHOLD SYSTEM
 * =========================
 */

export const thresholdSchema = z.object({
    stationId: z.string(),
    parameter: z.string(),

    minValue: z.number().optional(),
    maxValue: z.number().optional(),

    severityLevel: z.enum([
      'NORMAL',
      'MONITOR',
      'CAUTION',
      'RESTRICTED',
      'SEVERE',
      'CRITICAL',
    ]),

    actionRequired: z.string(),

    userRole: z.enum([
      'ADMIN',
      'METEOROLOGIST',
      'DISPATCHER',
      'PILOT',
      'ATC',
      'OPERATIONS',
      'GROUND_HANDLER',
    ]).optional(),

    isActive: z.boolean().default(true),
});

/**
 * =========================
 * FORECAST SYSTEM
 * =========================
 */

export const forecastSchema = z.object({
    stationId: z.string(),

    validFrom: z.string().datetime(),
    validTo: z.string().datetime(),

    taf: z.string().optional(),
    sigmetData: z.any().optional(),
    upperWind: z.any().optional(),
    upperTemp: z.any().optional(),

    freezingLevel: z.number().optional(),

    turbulenceForecast: z.string().optional(),
    icingForecast: z.string().optional(),
});

/**
 * =========================
 * ALERT SYSTEM
 * =========================
 */

export const alertSchema = z.object({
    userId: z.string(),

    type: z.enum([
      'WEATHER',
      'OPERATIONAL',
      'SAFETY',
      'SYSTEM',
      'MAINTENANCE',
    ]),

    message: z.string().min(1),

    severity: z.enum([
      'NORMAL',
      'MONITOR',
      'CAUTION',
      'RESTRICTED',
      'SEVERE',
      'CRITICAL',
    ]),

    actionUrl: z.string().optional(),

    expiresAt: z.string().datetime().optional(),
});

/**
 * =========================
 * REPORTING SYSTEM
 * =========================
 */

export const reportSchema = z.object({
    stationId: z.string(),

    startDate: z.string().datetime(),
    endDate: z.string().datetime(),

    type: z.enum([
      'WEATHER',
      'IMPACT',
      'OPERATIONAL',
      'FORECAST',
    ]),

    format: z.enum([
      'json',
      'pdf',
      'csv',
      'excel',
    ]).default('json'),
});