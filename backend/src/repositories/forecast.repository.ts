import { prisma } from '../utils/prisma';

export class ForecastRepository {
  static async findActiveByStation(stationId: string) {
    return prisma.forecastData.findFirst({
      where: { stationId, validFrom: { lte: new Date() }, validTo: { gte: new Date() } },
      orderBy: { validFrom: 'desc' },
    });
  }

  static async create(payload: any) {
    return prisma.forecastData.create({ data: payload });
  }
}
