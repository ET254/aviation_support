import { logger } from '../utils/logger';
import { AlertService } from '../services/alert.service';

export class AlertWorker {
  static async run(payload: any) {
    logger.info('Generating alerts from operational payload');
    const alert = {
      id: 'generated-alert',
      userId: payload.userId || 'system',
      type: 'WEATHER',
      severity: payload.severity || 'MONITOR',
      message: payload.message || 'Operational weather conditions require monitoring.',
      readStatus: false,
    };
    await AlertService.sendNotification(alert);
    return alert;
  }
}
