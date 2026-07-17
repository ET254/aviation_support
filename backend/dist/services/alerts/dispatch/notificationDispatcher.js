"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationDispatcher = exports.NotificationChannel = void 0;
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["DASHBOARD"] = "DASHBOARD";
    NotificationChannel["EMAIL"] = "EMAIL";
    NotificationChannel["SMS"] = "SMS";
    NotificationChannel["WHATSAPP"] = "WHATSAPP";
    NotificationChannel["PUSH"] = "PUSH";
    NotificationChannel["WEBHOOK"] = "WEBHOOK";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
class NotificationDispatcher {
    static async dispatch(alert) {
        const results = [];
        results.push(await this.dashboard(alert));
        results.push(await this.email(alert));
        results.push(await this.sms(alert));
        results.push(await this.whatsapp(alert));
        results.push(await this.push(alert));
        results.push(await this.webhook(alert));
        return results;
    }
    static async dispatchMany(alerts) {
        const results = [];
        for (const alert of alerts) {
            const dispatched = await this.dispatch(alert);
            results.push(...dispatched);
        }
        return results;
    }
    static async dashboard(alert) {
        console.info(`[Dashboard] ${alert.stationCode}: ${alert.title}`);
        return {
            channel: NotificationChannel.DASHBOARD,
            success: true,
            timestamp: new Date(),
            message: "Dashboard notification queued."
        };
    }
    static async email(alert) {
        console.info(`[Email] ${alert.stationCode}: ${alert.title}`);
        return {
            channel: NotificationChannel.EMAIL,
            success: true,
            timestamp: new Date(),
            message: "Email notification queued."
        };
    }
    static async sms(alert) {
        console.info(`[SMS] ${alert.stationCode}: ${alert.title}`);
        return {
            channel: NotificationChannel.SMS,
            success: true,
            timestamp: new Date(),
            message: "SMS notification queued."
        };
    }
    static async whatsapp(alert) {
        console.info(`[WhatsApp] ${alert.stationCode}: ${alert.title}`);
        return {
            channel: NotificationChannel.WHATSAPP,
            success: true,
            timestamp: new Date(),
            message: "WhatsApp notification queued."
        };
    }
    static async push(alert) {
        console.info(`[Push] ${alert.stationCode}: ${alert.title}`);
        return {
            channel: NotificationChannel.PUSH,
            success: true,
            timestamp: new Date(),
            message: "Push notification queued."
        };
    }
    static async webhook(alert) {
        console.info(`[Webhook] ${alert.stationCode}: ${alert.title}`);
        return {
            channel: NotificationChannel.WEBHOOK,
            success: true,
            timestamp: new Date(),
            message: "Webhook queued."
        };
    }
    static requiresImmediateDispatch(alert) {
        return (alert.priority === "IMMEDIATE" ||
            alert.priority === "URGENT");
    }
    static immediateAlerts(alerts) {
        return alerts.filter(alert => this.requiresImmediateDispatch(alert));
    }
}
exports.NotificationDispatcher = NotificationDispatcher;
//# sourceMappingURL=notificationDispatcher.js.map