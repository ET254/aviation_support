import { AlertModel } from "../models/AlertModel";

/**
 * ============================================================================
 * Notification Channel
 * ============================================================================
 */

export enum NotificationChannel {

    DASHBOARD = "DASHBOARD",

    EMAIL = "EMAIL",

    SMS = "SMS",

    WHATSAPP = "WHATSAPP",

    PUSH = "PUSH",

    WEBHOOK = "WEBHOOK"

}

/**
 * ============================================================================
 * Notification Result
 * ============================================================================
 */

export interface NotificationResult {

    channel: NotificationChannel;

    success: boolean;

    timestamp: Date;

    message: string;

}

/**
 * ============================================================================
 * Notification Dispatcher
 *
 * Central notification service for aviation alerts.
 *
 * Future integrations:
 *
 * • Dashboard (WebSocket / Socket.IO)
 * • Email (SMTP / SendGrid)
 * • SMS (Africa's Talking / Twilio)
 * • WhatsApp Business API
 * • Push Notifications
 * • Webhooks
 * • AFTN / AMHS
 * ============================================================================
 */

export class NotificationDispatcher {

    /**
     * =========================================================================
     * Dispatch alert through all configured channels
     * =========================================================================
     */

    static async dispatch(

        alert: AlertModel

    ): Promise<NotificationResult[]> {

        const results: NotificationResult[] = [];

        results.push(

            await this.dashboard(alert)

        );

        results.push(

            await this.email(alert)

        );

        results.push(

            await this.sms(alert)

        );

        results.push(

            await this.whatsapp(alert)

        );

        results.push(

            await this.push(alert)

        );

        results.push(

            await this.webhook(alert)

        );

        return results;

    }

    /**
     * =========================================================================
     * Dispatch multiple alerts
     * =========================================================================
     */

    static async dispatchMany(

        alerts: AlertModel[]

    ): Promise<NotificationResult[]> {

        const results: NotificationResult[] = [];

        for (const alert of alerts) {

            const dispatched =

                await this.dispatch(alert);

            results.push(...dispatched);

        }

        return results;

    }

    /**
     * =========================================================================
     * Dashboard
     * =========================================================================
     */

    private static async dashboard(

        alert: AlertModel

    ): Promise<NotificationResult> {

        console.info(

            `[Dashboard] ${alert.stationCode}: ${alert.title}`

        );

        // Future:
        // socket.emit("aviation-alert", alert);

        return {

            channel: NotificationChannel.DASHBOARD,

            success: true,

            timestamp: new Date(),

            message: "Dashboard notification queued."

        };

    }

    /**
     * =========================================================================
     * Email
     * =========================================================================
     */

    private static async email(

        alert: AlertModel

    ): Promise<NotificationResult> {

        console.info(

            `[Email] ${alert.stationCode}: ${alert.title}`

        );

        // Future:
        // SendGrid
        // Nodemailer
        // SES

        return {

            channel: NotificationChannel.EMAIL,

            success: true,

            timestamp: new Date(),

            message: "Email notification queued."

        };

    }

    /**
     * =========================================================================
     * SMS
     * =========================================================================
     */

    private static async sms(

        alert: AlertModel

    ): Promise<NotificationResult> {

        console.info(

            `[SMS] ${alert.stationCode}: ${alert.title}`

        );

        // Future:
        // Africa's Talking
        // Twilio

        return {

            channel: NotificationChannel.SMS,

            success: true,

            timestamp: new Date(),

            message: "SMS notification queued."

        };

    }

    /**
     * =========================================================================
     * WhatsApp
     * =========================================================================
     */

    private static async whatsapp(

        alert: AlertModel

    ): Promise<NotificationResult> {

        console.info(

            `[WhatsApp] ${alert.stationCode}: ${alert.title}`

        );

        // Future:
        // Meta WhatsApp Business API

        return {

            channel: NotificationChannel.WHATSAPP,

            success: true,

            timestamp: new Date(),

            message: "WhatsApp notification queued."

        };

    }

    /**
     * =========================================================================
     * Push Notification
     * =========================================================================
     */

    private static async push(

        alert: AlertModel

    ): Promise<NotificationResult> {

        console.info(

            `[Push] ${alert.stationCode}: ${alert.title}`

        );

        // Future:
        // Firebase
        // OneSignal

        return {

            channel: NotificationChannel.PUSH,

            success: true,

            timestamp: new Date(),

            message: "Push notification queued."

        };

    }

    /**
     * =========================================================================
     * Webhook
     * =========================================================================
     */

    private static async webhook(

        alert: AlertModel

    ): Promise<NotificationResult> {

        console.info(

            `[Webhook] ${alert.stationCode}: ${alert.title}`

        );

        // Future:
        // POST to configured endpoint

        return {

            channel: NotificationChannel.WEBHOOK,

            success: true,

            timestamp: new Date(),

            message: "Webhook queued."

        };

    }

    /**
     * =========================================================================
     * Determine if alert requires immediate notification
     * =========================================================================
     */

    static requiresImmediateDispatch(

        alert: AlertModel

    ): boolean {

        return (

            alert.priority === "IMMEDIATE" ||

            alert.priority === "URGENT"

        );

    }

    /**
     * =========================================================================
     * Filter alerts requiring immediate dispatch
     * =========================================================================
     */

    static immediateAlerts(

        alerts: AlertModel[]

    ): AlertModel[] {

        return alerts.filter(

            alert =>

                this.requiresImmediateDispatch(alert)

        );

    }

}