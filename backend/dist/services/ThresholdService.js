"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThresholdService = void 0;
const prisma_1 = require("../utils/prisma");
const client_1 = require("@prisma/client");
class ThresholdService {
    static async applyDefaultThresholds(stationId) {
        const defaults = [
            { parameter: 'visibility', minValue: 10000, maxValue: null, severityLevel: client_1.SeverityLevel.NORMAL, actionRequired: 'Normal operations continue.', userRole: null },
            { parameter: 'visibility', minValue: 5000, maxValue: 10000, severityLevel: client_1.SeverityLevel.MONITOR, actionRequired: 'Monitor visibility trends.', userRole: null },
            { parameter: 'visibility', minValue: 3000, maxValue: 5000, severityLevel: client_1.SeverityLevel.CAUTION, actionRequired: 'Reduced visibility procedures.', userRole: null },
            { parameter: 'wind_speed', minValue: 20, maxValue: 30, severityLevel: client_1.SeverityLevel.CAUTION, actionRequired: 'Crosswind limitations apply.', userRole: null },
            { parameter: 'wind_speed', minValue: 30, maxValue: null, severityLevel: client_1.SeverityLevel.RESTRICTED, actionRequired: 'Restricted operations.', userRole: null },
            { parameter: 'ceiling', minValue: 1000, maxValue: 3000, severityLevel: client_1.SeverityLevel.MONITOR, actionRequired: 'Prepare for instrument approach.', userRole: null },
            { parameter: 'temperature', minValue: 35, maxValue: null, severityLevel: client_1.SeverityLevel.RESTRICTED, actionRequired: 'Severe performance limitations.', userRole: null },
        ];
        const created = [];
        for (const threshold of defaults) {
            const existing = await prisma_1.prisma.threshold.findFirst({ where: { stationId, parameter: threshold.parameter, severityLevel: threshold.severityLevel } });
            if (!existing) {
                const record = await prisma_1.prisma.threshold.create({ data: { ...threshold, stationId } });
                created.push(record);
            }
        }
        return created;
    }
}
exports.ThresholdService = ThresholdService;
//# sourceMappingURL=ThresholdService.js.map