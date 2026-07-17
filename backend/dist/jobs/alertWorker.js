"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertWorker = void 0;
const logger_1 = require("../utils/logger");
const alert_service_1 = require("../services/alert.service");
class AlertWorker {
    static async run(payload) {
        logger_1.logger.info('Generating alerts from operational payload');
        const alert = {
            id: 'generated-alert',
            userId: payload.userId || 'system',
            type: 'WEATHER',
            severity: payload.severity || 'MONITOR',
            message: payload.message || 'Operational weather conditions require monitoring.',
            readStatus: false,
        };
        await alert_service_1.AlertService.sendNotification(alert);
        return alert;
    }
}
exports.AlertWorker = AlertWorker;
//# sourceMappingURL=alertWorker.js.map