"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = exports.sampleWeatherData = exports.additionalThresholds = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.additionalThresholds = [
    {
        parameter: 'visibility',
        minValue: 1500,
        maxValue: 3000,
        severityLevel: client_1.SeverityLevel.RESTRICTED,
        actionRequired: 'Low visibility procedures for all aircraft',
        userRole: client_1.UserRole.ATC,
    },
    {
        parameter: 'crosswind',
        minValue: 15,
        maxValue: 20,
        severityLevel: client_1.SeverityLevel.CAUTION,
        actionRequired: 'Exercise caution on approach, monitor crosswind limits',
        userRole: client_1.UserRole.PILOT,
    },
    {
        parameter: 'temperature',
        minValue: 30,
        maxValue: 35,
        severityLevel: client_1.SeverityLevel.MONITOR,
        actionRequired: 'Monitor engine performance and density altitude',
        userRole: client_1.UserRole.DISPATCHER,
    },
];
exports.sampleWeatherData = [
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
        cloudType: client_1.CloudType.SCATTERED,
        precipitationType: client_1.PrecipitationType.NONE,
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
        cloudType: client_1.CloudType.BROKEN,
        precipitationType: client_1.PrecipitationType.RAIN,
        precipitationIntensity: 2.5,
    },
];
const seedDatabase = async () => {
    try {
        console.log('Seeding database with additional data...');
        const stations = await prisma.station.findMany();
        for (const station of stations) {
            for (const threshold of exports.additionalThresholds) {
                await prisma.threshold.upsert({
                    where: {
                        stationId_parameter_userRole: {
                            stationId: station.id,
                            parameter: threshold.parameter,
                            userRole: threshold.userRole,
                        },
                    },
                    update: {},
                    create: {
                        ...threshold,
                        stationId: station.id,
                    },
                });
            }
            for (const weather of exports.sampleWeatherData) {
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
    }
    catch (error) {
        console.error('Error seeding additional data:', error);
        throw error;
    }
};
exports.seedDatabase = seedDatabase;
//# sourceMappingURL=seed-data.js.map