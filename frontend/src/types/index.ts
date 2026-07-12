export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  stationId?: string;
  station?: Station;
  isActive: boolean;
  preferences?: UserPreferences;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme?: 'light' | 'dark';
  notifications?: NotificationPreferences;
  dashboard?: DashboardPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  inApp: boolean;
}

export interface DashboardPreferences {
  refreshRate: number;
  widgets: string[];
}

export interface Station {
  id: string;
  name: string;
  code: string;
  wmoId?: string;
  latitude: number;
  longitude: number;
  elevation: number;
  terrainType: string;
  topographyDescription: string;
  runwayLength?: number;
  runwayOrientation?: string;
  runwaySurface?: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WeatherData {
  id: string;
  stationId: string;
  timestamp: string;
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
  cloudType?: string;
  precipitationType?: string;
  precipitationIntensity?: number;
  densityAltitude?: number;
  crosswindComponent?: number;
  headwindComponent?: number;
  tailwindComponent?: number;
  createdAt: string;
}

export interface Alert {
  id: string;
  userId: string;
  timestamp: string;
  type: string;
  message: string;
  readStatus: boolean;
  acknowledgedAt?: string;
  actionUrl?: string;
  severity: string;
  expiresAt?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}