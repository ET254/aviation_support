import { AlertCategory, AlertModel } from "../models/AlertModel";
import { AlertPriority } from "../models/AlertPriority";
import { AlertRecipient } from "../models/AlertRecipient";
import { AlertSeverity } from "../models/AlertSeverity";
export declare class AlertFormatter {
    static create(options: {
        stationId: string;
        stationCode: string;
        stationName?: string;
        category: AlertCategory;
        severity: AlertSeverity;
        priority: AlertPriority;
        title: string;
        message: string;
        summary: string;
        hazard: string;
        operationalImpact: string;
        recommendedActions?: string[];
        recipients?: AlertRecipient[];
        riskScore: number;
        confidence?: number;
        source?: string;
        weatherParameter?: string;
        parameterValue?: number | string;
        threshold?: number | string;
        validFrom?: Date;
        validTo?: Date;
        expiresAt?: Date;
        metadata?: Record<string, unknown>;
    }): AlertModel;
    static defaultRecipients(): AlertRecipient[];
    static emergencyRecipients(): AlertRecipient[];
    static addRecipient(recipients: AlertRecipient[], recipient: AlertRecipient): AlertRecipient[];
    static removeRecipient(recipients: AlertRecipient[], recipient: AlertRecipient): AlertRecipient[];
    static isEmergency(severity: AlertSeverity): boolean;
    static isWarning(severity: AlertSeverity): boolean;
}
//# sourceMappingURL=alertFormatter.d.ts.map