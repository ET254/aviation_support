import { prisma } from '../utils/prisma';

export class StationRepository {
  static async list() {
    return prisma.station.findMany({ orderBy: { name: 'asc' } });
  }

  static async getById(id: string) {
    return prisma.station.findUnique({ where: { id } });
  }

  static async getActive() {
    return prisma.station.findFirst({ where: { isActive: true } });
  }
}
