import { prisma } from '../utils/prisma';
import { SeverityLevel } from '@prisma/client';

export class ThresholdService {
  static async applyDefaultThresholds(stationId: string) {
    const defaults = [
      { parameter: 'visibility', minValue: 10000, maxValue: null, severityLevel: SeverityLevel.NORMAL, actionRequired: 'Normal operations continue.', userRole: null },
      { parameter: 'visibility', minValue: 5000, maxValue: 10000, severityLevel: SeverityLevel.MONITOR, actionRequired: 'Monitor visibility trends.', userRole: null },
      { parameter: 'visibility', minValue: 3000, maxValue: 5000, severityLevel: SeverityLevel.CAUTION, actionRequired: 'Reduced visibility procedures.', userRole: null },
      { parameter: 'wind_speed', minValue: 20, maxValue: 30, severityLevel: SeverityLevel.CAUTION, actionRequired: 'Crosswind limitations apply.', userRole: null },
      { parameter: 'wind_speed', minValue: 30, maxValue: null, severityLevel: SeverityLevel.RESTRICTED, actionRequired: 'Restricted operations.', userRole: null },
      { parameter: 'ceiling', minValue: 1000, maxValue: 3000, severityLevel: SeverityLevel.MONITOR, actionRequired: 'Prepare for instrument approach.', userRole: null },
      { parameter: 'temperature', minValue: 35, maxValue: null, severityLevel: SeverityLevel.RESTRICTED, actionRequired: 'Severe performance limitations.', userRole: null },
    ];

    const created = [] as any[];
    for (const threshold of defaults) {
      const existing = await prisma.threshold.findFirst({ where: { stationId, parameter: threshold.parameter, severityLevel: threshold.severityLevel } });
      if (!existing) {
        const record = await prisma.threshold.create({ data: { ...threshold, stationId } });
        created.push(record);
      }
    }
    return created;
  }
}
