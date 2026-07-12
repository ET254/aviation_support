import { AlertEngine } from '../AlertEngine.service';
import { AlertModel, AlertCategory, AlertStatus } from '../models/AlertModel';
import { AlertSeverity } from '../models/AlertSeverity';
import { AlertPriority } from '../models/AlertPriority';

jest.mock('../../../utils/prisma', () => ({
  prisma: {
    alert: {
      createMany: jest.fn()
    }
  }
}));

// We'll spy on the real dispatcher after requiring it below

describe('AlertEngine persistence and dispatch', () => {

  const sampleAlert: AlertModel = {
    id: 'test-alert-1',
    stationId: 'STN1',
    stationCode: 'STN1',
    category: AlertCategory.VISIBILITY,
    severity: AlertSeverity.WARNING,
    priority: AlertPriority.HIGH,
    status: AlertStatus.ACTIVE,
    title: 'Low Visibility',
    message: 'Visibility below threshold',
    summary: 'Visibility degraded',
    hazard: 'FOG',
    operationalImpact: 'Reduced visual operations',
    recommendedActions: ['Use instrument approach'],
    recipients: [],
    riskScore: 7,
    confidence: 0.8,
    issuedAt: new Date(),
    validFrom: new Date(),
    validTo: new Date(Date.now() + 60 * 60 * 1000),
    source: 'AUTO',
  };

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.SYSTEM_USER_ID = 'system-user';
  });

  it('persists alerts using prisma.createMany', async () => {
    const { prisma } = require('../../../utils/prisma');

    await AlertEngine.persistAlerts([sampleAlert]);

    expect(prisma.alert.createMany).toHaveBeenCalled();
    const callArg = (prisma.alert.createMany as jest.Mock).mock.calls[0][0];
    expect(callArg.data[0].id).toBe(sampleAlert.id);
    expect(callArg.data[0].userId).toBe(process.env.SYSTEM_USER_ID);
  });

  it('dispatches alerts via NotificationDispatcher', async () => {
    const NotificationDispatcher = require('../dispatch/notificationDispatcher').NotificationDispatcher;
    jest.spyOn(NotificationDispatcher, 'dispatchMany').mockResolvedValue([]);

    await AlertEngine.dispatchAlerts([sampleAlert]);

    expect(NotificationDispatcher.dispatchMany).toHaveBeenCalledWith([sampleAlert]);
  });

});
