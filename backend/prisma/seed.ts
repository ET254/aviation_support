import { PrismaClient, UserRole, TerrainType, AirportCategory, SeverityLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const kenyanAirports = [
  {
    name: 'Jomo Kenyatta International Airport',
    code: 'HKJK',
    wmoId: '63740',
    latitude: -1.3192,
    longitude: 36.9278,
    elevation: 5330,
    terrainType: TerrainType.HIGHLANDS,
    topographyDescription: 'Highland plateau with moderate terrain variations. Located at 5,330 feet elevation.',
    runwayLength: 13500,
    runwayOrientation: '06/24',
    runwaySurface: 'Asphalt',
    category: AirportCategory.INTERNATIONAL,
  },
  {
    name: 'Wilson Airport',
    code: 'HKNW',
    wmoId: '63741',
    latitude: -1.3217,
    longitude: 36.8148,
    elevation: 5530,
    terrainType: TerrainType.HIGHLANDS,
    topographyDescription: 'Urban highland terrain with surrounding residential areas.',
    runwayLength: 4900,
    runwayOrientation: '07/25',
    runwaySurface: 'Asphalt',
    category: AirportCategory.DOMESTIC,
  },
  {
    name: 'Moi International Airport',
    code: 'HKMO',
    wmoId: '63820',
    latitude: -4.0348,
    longitude: 39.5942,
    elevation: 200,
    terrainType: TerrainType.COASTAL,
    topographyDescription: 'Coastal plain with tropical climate. Near Indian Ocean.',
    runwayLength: 10950,
    runwayOrientation: '03/21',
    runwaySurface: 'Asphalt',
    category: AirportCategory.INTERNATIONAL,
  },
  {
    name: 'Kisumu International Airport',
    code: 'HKKI',
    wmoId: '63708',
    latitude: -0.0916,
    longitude: 34.7810,
    elevation: 3795,
    terrainType: TerrainType.LAKE_REGION,
    topographyDescription: 'Lake Victoria basin with unique microclimate. Prone to thunderstorms.',
    runwayLength: 10800,
    runwayOrientation: '06/24',
    runwaySurface: 'Asphalt',
    category: AirportCategory.INTERNATIONAL,
  },
  {
    name: 'Eldoret International Airport',
    code: 'HKEL',
    wmoId: '63720',
    latitude: 0.4036,
    longitude: 35.2382,
    elevation: 7053,
    terrainType: TerrainType.HIGHLANDS,
    topographyDescription: 'High altitude plateau (7,053 ft). Rift Valley region.',
    runwayLength: 11500,
    runwayOrientation: '07/25',
    runwaySurface: 'Asphalt',
    category: AirportCategory.DOMESTIC,
  },
  {
    name: 'Lodwar Airstrip',
    code: 'HKLO',
    wmoId: '63600',
    latitude: 3.1167,
    longitude: 35.6167,
    elevation: 1706,
    terrainType: TerrainType.SEMI_ARID,
    topographyDescription: 'Arid and semi-arid terrain. Turkana Basin.',
    runwayLength: 5900,
    runwayOrientation: '09/27',
    runwaySurface: 'Gravel',
    category: AirportCategory.AERODROME,
  },
  {
    name: 'Malindi Airstrip',
    code: 'HKML',
    wmoId: '63825',
    latitude: -3.2292,
    longitude: 40.1017,
    elevation: 25,
    terrainType: TerrainType.COASTAL,
    topographyDescription: 'Coastal flat terrain with tropical climate.',
    runwayLength: 4600,
    runwayOrientation: '10/28',
    runwaySurface: 'Asphalt',
    category: AirportCategory.DOMESTIC,
  },
  {
    name: 'Nanyuki Airstrip',
    code: 'HKNY',
    wmoId: '63605',
    latitude: 0.0622,
    longitude: 37.0417,
    elevation: 6350,
    terrainType: TerrainType.VALLEY_MOUNTAIN,
    topographyDescription: 'Mountain valley terrain. Near Mount Kenya.',
    runwayLength: 5900,
    runwayOrientation: '01/19',
    runwaySurface: 'Gravel',
    category: AirportCategory.AERODROME,
  },
];

const users = [
  {
    email: 'admin@aviation.com',
    name: 'System Administrator',
    role: UserRole.ADMIN,
    password: 'Admin123!',
  },
  {
    email: 'met@aviation.com',
    name: 'John Met',
    role: UserRole.METEOROLOGIST,
    password: 'Met123!',
  },
  {
    email: 'dispatch@aviation.com',
    name: 'Jane Dispatcher',
    role: UserRole.DISPATCHER,
    password: 'Dispatch123!',
  },
  {
    email: 'pilot@aviation.com',
    name: 'Mike Pilot',
    role: UserRole.PILOT,
    password: 'Pilot123!',
  },
  {
    email: 'atc@aviation.com',
    name: 'Sarah ATC',
    role: UserRole.ATC,
    password: 'Atc123!',
  },
  {
    email: 'ops@aviation.com',
    name: 'David Operations',
    role: UserRole.OPERATIONS,
    password: 'Ops123!',
  },
  {
    email: 'ground@aviation.com',
    name: 'Lisa Ground',
    role: UserRole.GROUND_HANDLER,
    password: 'Ground123!',
  },
];

const thresholds = [
  // Visibility thresholds
  { parameter: 'visibility', minValue: 10000, maxValue: null, severityLevel: SeverityLevel.NORMAL, actionRequired: 'Normal operations continue.' },
  { parameter: 'visibility', minValue: 5000, maxValue: 10000, severityLevel: SeverityLevel.MONITOR, actionRequired: 'Monitor visibility trends. Prepare for possible reduction.' },
  { parameter: 'visibility', minValue: 3000, maxValue: 5000, severityLevel: SeverityLevel.CAUTION, actionRequired: 'Caution: Reduced visibility. Increase spacing.' },
  { parameter: 'visibility', minValue: 1000, maxValue: 3000, severityLevel: SeverityLevel.RESTRICTED, actionRequired: 'Restricted operations. Low visibility procedures.' },
  { parameter: 'visibility', minValue: 550, maxValue: 1000, severityLevel: SeverityLevel.SEVERE, actionRequired: 'Severe visibility. Consider diverting.' },
  
  // Wind speed thresholds
  { parameter: 'wind_speed', minValue: 0, maxValue: 10, severityLevel: SeverityLevel.NORMAL, actionRequired: 'Normal operations.' },
  { parameter: 'wind_speed', minValue: 10, maxValue: 20, severityLevel: SeverityLevel.MONITOR, actionRequired: 'Monitor wind conditions.' },
  { parameter: 'wind_speed', minValue: 20, maxValue: 30, severityLevel: SeverityLevel.CAUTION, actionRequired: 'Crosswind limitations may apply.' },
  { parameter: 'wind_speed', minValue: 30, maxValue: 40, severityLevel: SeverityLevel.RESTRICTED, actionRequired: 'Restricted operations. Heavy aircraft only.' },
  { parameter: 'wind_speed', minValue: 40, maxValue: null, severityLevel: SeverityLevel.SEVERE, actionRequired: 'Stop operations. Secure aircraft.' },
  
  // Ceiling/Cloud base thresholds
  { parameter: 'ceiling', minValue: 3000, maxValue: null, severityLevel: SeverityLevel.NORMAL, actionRequired: 'Visual approach possible.' },
  { parameter: 'ceiling', minValue: 1000, maxValue: 3000, severityLevel: SeverityLevel.MONITOR, actionRequired: 'Prepare for instrument approach.' },
  { parameter: 'ceiling', minValue: 500, maxValue: 1000, severityLevel: SeverityLevel.CAUTION, actionRequired: 'Instrument approach required. Reduced separation.' },
  { parameter: 'ceiling', minValue: 200, maxValue: 500, severityLevel: SeverityLevel.RESTRICTED, actionRequired: 'CAT I ILS approach required.' },
  { parameter: 'ceiling', minValue: 0, maxValue: 200, severityLevel: SeverityLevel.SEVERE, actionRequired: 'Low visibility procedures. CAT II/III required.' },
  
  // Temperature/Density Altitude thresholds
  { parameter: 'temperature', minValue: 0, maxValue: 30, severityLevel: SeverityLevel.NORMAL, actionRequired: 'Normal temperature range.' },
  { parameter: 'temperature', minValue: 30, maxValue: 35, severityLevel: SeverityLevel.MONITOR, actionRequired: 'Monitor density altitude effects.' },
  { parameter: 'temperature', minValue: 35, maxValue: 40, severityLevel: SeverityLevel.CAUTION, actionRequired: 'High density altitude. Performance reduction.' },
  { parameter: 'temperature', minValue: 40, maxValue: null, severityLevel: SeverityLevel.RESTRICTED, actionRequired: 'Severe performance limitations.' },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Create stations
  console.log('📡 Creating stations...');
  for (const airport of kenyanAirports) {
    await prisma.station.upsert({
      where: { code: airport.code },
      update: {},
      create: airport,
    });
  }

  // Set JKIA as active
  await prisma.station.update({
    where: { code: 'HKJK' },
    data: { isActive: true },
  });

  // Create users
  console.log('👤 Creating users...');
  const jkia = await prisma.station.findUnique({ where: { code: 'HKJK' } });
  
  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
        stationId: jkia?.id,
        preferences: {},
      },
    });
  }

  // Create thresholds
  console.log('⚙️ Creating thresholds...');
  for (const threshold of thresholds) {
    await prisma.threshold.create({
      data: {
        stationId: jkia!.id,
        ...threshold,
      },
    });
  }

  // Create sample weather data
  console.log('🌤️ Creating sample weather data...');
  const now = new Date();
  const stations = await prisma.station.findMany();

  for (const station of stations) {
    // Generate last 24 hours of weather data
    for (let i = 24; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 3600000);
      const temp = 20 + Math.random() * 10 - 5;
      const windDir = Math.random() * 360;
      const windSpeed = 5 + Math.random() * 25;
      
      await prisma.weatherData.create({
        data: {
          stationId: station.id,
          timestamp,
          temperature: temp,
          windDirection: windDir,
          windSpeed: windSpeed,
          gustSpeed: windSpeed + Math.random() * 10,
          visibility: 5000 + Math.random() * 15000,
          rvr: 400 + Math.random() * 1600,
          pressureQnh: 1013 + Math.random() * 10 - 5,
          pressureQfe: 1010 + Math.random() * 10 - 5,
          humidity: 40 + Math.random() * 40,
          dewPoint: 10 + Math.random() * 10,
          cloudAmount: Math.floor(Math.random() * 9),
          cloudBase: 1000 + Math.random() * 5000,
          cloudType: ['CLEAR', 'FEW', 'SCATTERED', 'BROKEN', 'OVERCAST'][Math.floor(Math.random() * 5)] as any,
          precipitationType: ['NONE', 'RAIN', 'SNOW', 'SLEET'][Math.floor(Math.random() * 4)] as any,
          precipitationIntensity: Math.random() * 10,
          densityAltitude: 2000 + Math.random() * 3000,
          crosswindComponent: Math.sin(windDir * Math.PI / 180) * windSpeed,
          headwindComponent: Math.cos(windDir * Math.PI / 180) * windSpeed,
          tailwindComponent: -Math.cos(windDir * Math.PI / 180) * windSpeed,
        },
      });
    }
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });