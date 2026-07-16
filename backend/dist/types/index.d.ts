import { Request } from 'express';
import { UserRole, SeverityLevel, AlertType, TerrainType, AirportCategory, CloudType, PrecipitationType } from '@prisma/client';
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: UserRole;
        stationId?: string;
    };
}
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    pagination?: PaginationInfo;
}
export interface PaginationInfo {
    total: number;
    limit: number;
    offset: number;
}
export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    stationId?: string;
    isActive: boolean;
    preferences: UserPreferences;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserPreferences {
    theme?: 'light' | 'dark';
    notifications?: NotificationPreferences;
    dashboard?: DashboardPreferences;
    language?: string;
}
export interface NotificationPreferences {
    email: boolean;
    sms: boolean;
    inApp: boolean;
    types: AlertType[];
}
export interface DashboardPreferences {
    widgets: string[];
    layout: string;
    refreshRate: number;
}
export interface Station {
    id: string;
    name: string;
    code: string;
    wmoId?: string;
    latitude: number;
    longitude: number;
    elevation: number;
    terrainType: TerrainType;
    topographyDescription: string;
    runwayLength?: number;
    runwayOrientation?: string;
    runwaySurface?: string;
    category: AirportCategory;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface WeatherData {
    id: string;
    stationId: string;
    timestamp: Date;
    temperature?: number;
    windDirection?: number;
    windSpeed?: number;
    gustSpeed?: number;
    visibility?: number;
    rvr?: number;
    pressureQnh?: number;
    pressureQfe?: number;
    humidity?: number;
    dewPoint?: number;
    cloudAmount?: number;
    cloudBase?: number;
    cloudType?: CloudType;
    precipitationType?: PrecipitationType;
    precipitationIntensity?: number;
    densityAltitude?: number;
    crosswindComponent?: number;
    headwindComponent?: number;
    tailwindComponent?: number;
    createdAt: Date;
}
export interface ForecastData {
    id: string;
    stationId: string;
    validFrom: Date;
    validTo: Date;
    taf?: string;
    sigmetData?: any;
    upperWind?: any;
    upperTemp?: any;
    freezingLevel?: number;
    turbulenceForecast?: string;
    icingForecast?: string;
    source: string;
    fileReference?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Threshold {
    id: string;
    stationId: string;
    parameter: string;
    minValue?: number;
    maxValue?: number;
    severityLevel: SeverityLevel;
    actionRequired: string;
    userRole?: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface ImpactLog {
    id: string;
    userId: string;
    stationId: string;
    timestamp: Date;
    eventType: string;
    severity: SeverityLevel;
    description: string;
    actionTaken?: string;
    isResolved: boolean;
    resolvedAt?: Date;
    metadata?: any;
}
export interface ImpactAssessment {
    overallSeverity: SeverityLevel;
    summary: string;
    roleImpacts: Record<string, RoleImpact>;
    recommendations: Recommendation[];
    severityColor: string;
}
export interface RoleImpact {
    severity: SeverityLevel;
    details: Record<string, any>;
    timestamp: Date;
}
export interface Recommendation {
    priority: 'critical' | 'high' | 'medium' | 'low';
    action: string;
    role: string;
}
export interface Alert {
    id: string;
    userId: string;
    timestamp: Date;
    type: AlertType;
    message: string;
    readStatus: boolean;
    acknowledgedAt?: Date;
    actionUrl?: string;
    severity: SeverityLevel;
    expiresAt?: Date;
    createdAt: Date;
}
export interface Report {
    id: string;
    type: 'WEATHER' | 'IMPACT' | 'OPERATIONAL' | 'FORECAST';
    stationId: string;
    generatedAt: Date;
    period: {
        startDate: Date;
        endDate: Date;
    };
    data: any;
    format: 'json' | 'pdf' | 'csv' | 'excel';
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface RegisterData {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    stationId?: string;
}
export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    statusCode: number;
}
export interface ChartDataPoint {
    timestamp: Date | string;
    value: number;
    label?: string;
}
export interface ChartSeries {
    name: string;
    data: ChartDataPoint[];
    color?: string;
}
export interface WebSocketEvent {
    type: 'WEATHER_UPDATE' | 'ALERT' | 'FORECAST_UPDATE' | 'IMPACT_UPDATE';
    data: any;
    timestamp: Date;
}
export interface AppConfig {
    nodeEnv: string;
    port: number;
    database: {
        url: string;
    };
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    corsOrigin: string;
    logging: {
        level: string;
    };
    upload: {
        maxFileSize: number;
        allowedMimeTypes: string[];
    };
    email: {
        host?: string;
        port?: number;
        user?: string;
        pass?: string;
    };
}
export interface AppErrorResponse {
    success: false;
    message: string;
    statusCode: number;
    stack?: string;
    details?: any;
}
export interface UploadedFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer?: Buffer;
}
//# sourceMappingURL=index.d.ts.map