"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StationRepository = void 0;
const prisma_1 = require("../utils/prisma");
class StationRepository {
    static async list() {
        return prisma_1.prisma.station.findMany({ orderBy: { name: 'asc' } });
    }
    static async getById(id) {
        return prisma_1.prisma.station.findUnique({ where: { id } });
    }
    static async getActive() {
        return prisma_1.prisma.station.findFirst({ where: { isActive: true } });
    }
}
exports.StationRepository = StationRepository;
//# sourceMappingURL=station.repository.js.map