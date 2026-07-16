import { AlertModel } from "../models/AlertModel";
export declare enum NotificationChannel {
    DASHBOARD = "DASHBOARD",
    EMAIL = "EMAIL",
    SMS = "SMS",
    WHATSAPP = "WHATSAPP",
    PUSH = "PUSH",
    WEBHOOK = "WEBHOOK"
}
export interface NotificationResult {
    channel: NotificationChannel;
    success: boolean;
    timestamp: Date;
    message: string;
}
export declare class NotificationDispatcher {
    static dispatch(alert: AlertModel): Promise<NotificationResult[]>;
    static dispatchMany(alerts: AlertModel[]): Promise<NotificationResult[]>;
    private static dashboard;
    private static email;
    private static sms;
    private static whatsapp;
    private static push;
    private static webhook;
    static requiresImmediateDispatch(alert: AlertModel): boolean;
    static immediateAlerts(alerts: AlertModel[]): AlertModel[];
}
//# sourceMappingURL=notificationDispatcher.d.ts.map