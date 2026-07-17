import { PrismaClient, UserRole, TerrainType, AirportCategory, SeverityLevel, CloudType, PrecipitationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// This file contains additional seed data for testing
export const additionalThresholds = [
  // Additional thresholds for different roles
  {
    parameter: 'visibility',
    minValue: 1500,
    maxValue: 3000,
    severityLevel: SeverityLevel.RESTRICTED,
    actionRequired: 'Low visibility procedures for all aircraft',
    userRole: UserRole.ATC,
  },
  {
    parameter: 'crosswind',
    minValue: 15,
    maxValue: 20,
    severityLevel: SeverityLevel.CAUTION,
    actionRequired: 'Exercise caution on approach, monitor crosswind limits',
    userRole: UserRole.PILOT,
  },
  {
    parameter: 'temperature',
    minValue: 30,
    maxValue: 35,
    severityLevel: SeverityLevel.MONITOR,
    actionRequired: 'Monitor engine performance and density altitude',
    userRole: UserRole.DISPATCHER,
  },
];

export const sampleWeatherData = [
  // Sample weather data for different times
  {
    temperature: 22.5,
    windDirection: 230,
    windSpeed: 12,
    gustSpeed: 18,
    visibility: 8000,
    rvr: 1200,
    pressureQnh: 1015,
    pressureQfe: 1012,
    humidity: 65,
    dewPoint: 15.5,
    cloudAmount: 4,
    cloudBase: 2500,
    cloudType: CloudType.SCATTERED,
    precipitationType: PrecipitationType.NONE,
    precipitationIntensity: 0,
  },
  {
    temperature: 20.0,
    windDirection: 180,
    windSpeed: 25,
    gustSpeed: 35,
    visibility: 4500,
    rvr: 800,
    pressureQnh: 1010,
    pressureQfe: 1008,
    humidity: 75,
    dewPoint: 15.0,
    cloudAmount: 6,
    cloudBase: 800,
    cloudType: CloudType.BROKEN,
    precipitationType: PrecipitationType.RAIN,
    precipitationIntensity: 2.5,
  },
];

export const seedDatabase = async () => {
  try {
    console.log('Seeding database with additional data...');

    // Add sample thresholds for all stations
    const stations = await prisma.station.findMany();
    
    for (const station of stations) {
      for (const threshold of additionalThresholds) {
        await prisma.threshold.upsert({
          where: {
            stationId_parameter_userRole: {
              stationId: station.id,
              parameter: threshold.parameter,
              userRole: threshold.userRole as UserRole,
            },
          },
          update: {},
          create: {
            ...threshold,
            stationId: station.id,
          },
        });
      }

      // Add sample weather data
      for (const weather of sampleWeatherData) {
        await prisma.weatherData.create({
          data: {
            ...weather,
            stationId: station.id,
            timestamp: new Date(Date.now() - Math.random() * 86400000),
          },
        });
      }
    }

    console.log('Additional seed data added successfully');
  } catch (error) {
    console.error('Error seeding additional data:', error);
    throw error;
  }
};