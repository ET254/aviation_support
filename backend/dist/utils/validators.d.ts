import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    role: z.ZodEnum<["ADMIN", "METEOROLOGIST", "DISPATCHER", "PILOT", "ATC", "OPERATIONS", "GROUND_HANDLER"]>;
    stationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name: string;
    role: "ADMIN" | "METEOROLOGIST" | "DISPATCHER" | "PILOT" | "ATC" | "OPERATIONS" | "GROUND_HANDLER";
    stationId?: string | undefined;
}, {
    email: string;
    password: string;
    name: string;
    role: "ADMIN" | "METEOROLOGIST" | "DISPATCHER" | "PILOT" | "ATC" | "OPERATIONS" | "GROUND_HANDLER";
    stationId?: string | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
export declare const stationSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodString;
    wmoId: z.ZodOptional<z.ZodString>;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    elevation: z.ZodNumber;
    terrainType: z.ZodEnum<["HIGHLANDS", "COASTAL", "LAKE_REGION", "SEMI_ARID", "VALLEY_MOUNTAIN", "PLAINS", "DESERT"]>;
    topographyDescription: z.ZodString;
    runwayLength: z.ZodOptional<z.ZodNumber>;
    runwayOrientation: z.ZodOptional<z.ZodString>;
    runwaySurface: z.ZodOptional<z.ZodString>;
    category: z.ZodEnum<["INTERNATIONAL", "DOMESTIC", "AERODROME", "AIRSTRIP"]>;
}, "strip", z.ZodTypeAny, {
    name: string;
    code: string;
    latitude: number;
    longitude: number;
    elevation: number;
    terrainType: "HIGHLANDS" | "COASTAL" | "LAKE_REGION" | "SEMI_ARID" | "VALLEY_MOUNTAIN" | "PLAINS" | "DESERT";
    topographyDescription: string;
    category: "INTERNATIONAL" | "DOMESTIC" | "AERODROME" | "AIRSTRIP";
    wmoId?: string | undefined;
    runwayLength?: number | undefined;
    runwayOrientation?: string | undefined;
    runwaySurface?: string | undefined;
}, {
    name: string;
    code: string;
    latitude: number;
    longitude: number;
    elevation: number;
    terrainType: "HIGHLANDS" | "COASTAL" | "LAKE_REGION" | "SEMI_ARID" | "VALLEY_MOUNTAIN" | "PLAINS" | "DESERT";
    topographyDescription: string;
    category: "INTERNATIONAL" | "DOMESTIC" | "AERODROME" | "AIRSTRIP";
    wmoId?: string | undefined;
    runwayLength?: number | undefined;
    runwayOrientation?: string | undefined;
    runwaySurface?: string | undefined;
}>;
export declare const weatherSchema: z.ZodObject<{
    stationId: z.ZodString;
    timestamp: z.ZodString;
    temperature: z.ZodOptional<z.ZodNumber>;
    windDirection: z.ZodOptional<z.ZodNumber>;
    windSpeed: z.ZodOptional<z.ZodNumber>;
    gustSpeed: z.ZodOptional<z.ZodNumber>;
    visibility: z.ZodOptional<z.ZodNumber>;
    rvr: z.ZodOptional<z.ZodNumber>;
    pressureQnh: z.ZodOptional<z.ZodNumber>;
    pressureQfe: z.ZodOptional<z.ZodNumber>;
    humidity: z.ZodOptional<z.ZodNumber>;
    dewPoint: z.ZodOptional<z.ZodNumber>;
    cloudAmount: z.ZodOptional<z.ZodNumber>;
    cloudBase: z.ZodOptional<z.ZodNumber>;
    cloudType: z.ZodOptional<z.ZodEnum<["CLEAR", "FEW", "SCATTERED", "BROKEN", "OVERCAST", "VERTICAL_DEVELOPMENT"]>>;
    precipitationType: z.ZodOptional<z.ZodEnum<["NONE", "RAIN", "SNOW", "SLEET", "HAIL", "FREEZING_RAIN"]>>;
    precipitationIntensity: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    stationId: string;
    temperature?: number | undefined;
    windDirection?: number | undefined;
    windSpeed?: number | undefined;
    gustSpeed?: number | undefined;
    visibility?: number | undefined;
    rvr?: number | undefined;
    pressureQnh?: number | undefined;
    pressureQfe?: number | undefined;
    humidity?: number | undefined;
    dewPoint?: number | undefined;
    cloudAmount?: number | undefined;
    cloudBase?: number | undefined;
    cloudType?: "CLEAR" | "FEW" | "SCATTERED" | "BROKEN" | "OVERCAST" | "VERTICAL_DEVELOPMENT" | undefined;
    precipitationType?: "NONE" | "RAIN" | "SNOW" | "SLEET" | "HAIL" | "FREEZING_RAIN" | undefined;
    precipitationIntensity?: number | undefined;
}, {
    timestamp: string;
    stationId: string;
    temperature?: number | undefined;
    windDirection?: number | undefined;
    windSpeed?: number | undefined;
    gustSpeed?: number | undefined;
    visibility?: number | undefined;
    rvr?: number | undefined;
    pressureQnh?: number | undefined;
    pressureQfe?: number | undefined;
    humidity?: number | undefined;
    dewPoint?: number | undefined;
    cloudAmount?: number | undefined;
    cloudBase?: number | undefined;
    cloudType?: "CLEAR" | "FEW" | "SCATTERED" | "BROKEN" | "OVERCAST" | "VERTICAL_DEVELOPMENT" | undefined;
    precipitationType?: "NONE" | "RAIN" | "SNOW" | "SLEET" | "HAIL" | "FREEZING_RAIN" | undefined;
    precipitationIntensity?: number | undefined;
}>;
export declare const thresholdSchema: z.ZodObject<{
    stationId: z.ZodString;
    parameter: z.ZodString;
    minValue: z.ZodOptional<z.ZodNumber>;
    maxValue: z.ZodOptional<z.ZodNumber>;
    severityLevel: z.ZodEnum<["NORMAL", "MONITOR", "CAUTION", "RESTRICTED", "SEVERE", "CRITICAL"]>;
    actionRequired: z.ZodString;
    userRole: z.ZodOptional<z.ZodEnum<["ADMIN", "METEOROLOGIST", "DISPATCHER", "PILOT", "ATC", "OPERATIONS", "GROUND_HANDLER"]>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    stationId: string;
    parameter: string;
    severityLevel: "NORMAL" | "MONITOR" | "CAUTION" | "RESTRICTED" | "SEVERE" | "CRITICAL";
    actionRequired: string;
    isActive: boolean;
    minValue?: number | undefined;
    maxValue?: number | undefined;
    userRole?: "ADMIN" | "METEOROLOGIST" | "DISPATCHER" | "PILOT" | "ATC" | "OPERATIONS" | "GROUND_HANDLER" | undefined;
}, {
    stationId: string;
    parameter: string;
    severityLevel: "NORMAL" | "MONITOR" | "CAUTION" | "RESTRICTED" | "SEVERE" | "CRITICAL";
    actionRequired: string;
    minValue?: number | undefined;
    maxValue?: number | undefined;
    userRole?: "ADMIN" | "METEOROLOGIST" | "DISPATCHER" | "PILOT" | "ATC" | "OPERATIONS" | "GROUND_HANDLER" | undefined;
    isActive?: boolean | undefined;
}>;
export declare const forecastSchema: z.ZodObject<{
    stationId: z.ZodString;
    validFrom: z.ZodString;
    validTo: z.ZodString;
    taf: z.ZodOptional<z.ZodString>;
    sigmetData: z.ZodOptional<z.ZodAny>;
    upperWind: z.ZodOptional<z.ZodAny>;
    upperTemp: z.ZodOptional<z.ZodAny>;
    freezingLevel: z.ZodOptional<z.ZodNumber>;
    turbulenceForecast: z.ZodOptional<z.ZodString>;
    icingForecast: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    stationId: string;
    validFrom: string;
    validTo: string;
    taf?: string | undefined;
    sigmetData?: any;
    upperWind?: any;
    upperTemp?: any;
    freezingLevel?: number | undefined;
    turbulenceForecast?: string | undefined;
    icingForecast?: string | undefined;
}, {
    stationId: string;
    validFrom: string;
    validTo: string;
    taf?: string | undefined;
    sigmetData?: any;
    upperWind?: any;
    upperTemp?: any;
    freezingLevel?: number | undefined;
    turbulenceForecast?: string | undefined;
    icingForecast?: string | undefined;
}>;
export declare const alertSchema: z.ZodObject<{
    userId: z.ZodString;
    type: z.ZodEnum<["WEATHER", "OPERATIONAL", "SAFETY", "SYSTEM", "MAINTENANCE"]>;
    message: z.ZodString;
    severity: z.ZodEnum<["NORMAL", "MONITOR", "CAUTION", "RESTRICTED", "SEVERE", "CRITICAL"]>;
    actionUrl: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    type: "WEATHER" | "OPERATIONAL" | "SAFETY" | "SYSTEM" | "MAINTENANCE";
    userId: string;
    severity: "NORMAL" | "MONITOR" | "CAUTION" | "RESTRICTED" | "SEVERE" | "CRITICAL";
    actionUrl?: string | undefined;
    expiresAt?: string | undefined;
}, {
    message: string;
    type: "WEATHER" | "OPERATIONAL" | "SAFETY" | "SYSTEM" | "MAINTENANCE";
    userId: string;
    severity: "NORMAL" | "MONITOR" | "CAUTION" | "RESTRICTED" | "SEVERE" | "CRITICAL";
    actionUrl?: string | undefined;
    expiresAt?: string | undefined;
}>;
export declare const reportSchema: z.ZodObject<{
    stationId: z.ZodString;
    startDate: z.ZodString;
    endDate: z.ZodString;
    type: z.ZodEnum<["WEATHER", "IMPACT", "OPERATIONAL", "FORECAST"]>;
    format: z.ZodDefault<z.ZodEnum<["json", "pdf", "csv", "excel"]>>;
}, "strip", z.ZodTypeAny, {
    format: "json" | "pdf" | "csv" | "excel";
    type: "WEATHER" | "OPERATIONAL" | "IMPACT" | "FORECAST";
    stationId: string;
    startDate: string;
    endDate: string;
}, {
    type: "WEATHER" | "OPERATIONAL" | "IMPACT" | "FORECAST";
    stationId: string;
    startDate: string;
    endDate: string;
    format?: "json" | "pdf" | "csv" | "excel" | undefined;
}>;
//# sourceMappingURL=validators.d.ts.map