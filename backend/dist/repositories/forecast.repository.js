"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForecastRepository = void 0;
const prisma_1 = require("../utils/prisma");
class ForecastRepository {
    static async findActiveByStation(stationId) {
        return prisma_1.prisma.forecastData.findFirst({
            where: { stationId, validFrom: { lte: new Date() }, validTo: { gte: new Date() } },
            orderBy: { validFrom: 'desc' },
        });
    }
    static async create(payload) {
        return prisma_1.prisma.forecastData.create({ data: payload });
    }
}
exports.ForecastRepository = ForecastRepository;
//# sourceMappingURL=forecast.repository.js.map