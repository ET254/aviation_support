import { randomUUID } from "crypto";

import {
    AlertCategory,
    AlertModel,
    AlertStatus
} from "../models/AlertModel";

import { AlertPriority } from "../models/AlertPriority";
import { AlertRecipient } from "../models/AlertRecipient";
import { AlertSeverity } from "../models/AlertSeverity";

/**
 * ============================================================================
 * Alert Formatter
 * ----------------------------------------------------------------------------
 * Builds standardized aviation alerts.
 *
 * All alert generators should use this formatter instead of constructing
 * AlertModel objects directly.
 * ============================================================================
 */

export class AlertFormatter {

    /**
     * ================================================================
     * Create Alert
     * ================================================================
     */

    static create(

        options: {

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

        }

    ): AlertModel {

        const now = new Date();

        return {

            id: randomUUID(),

            stationId: options.stationId,

            stationCode: options.stationCode,

            stationName: options.stationName,

            category: options.category,

            severity: options.severity,

            priority: options.priority,

            status: AlertStatus.ACTIVE,

            title: options.title,

            message: options.message,

            summary: options.summary,

            hazard: options.hazard,

            operationalImpact:
                options.operationalImpact,

            recommendedActions:
                options.recommendedActions ?? [],

            recipients:
                options.recipients ?? [],

            riskScore:
                options.riskScore,

            confidence:
                options.confidence,

            issuedAt: now,

            validFrom:
                options.validFrom ?? now,

            validTo:
                options.validTo,

            expiresAt:
                options.expiresAt,

            source:
                options.source ?? "Decision Support Engine",

            weatherParameter:
                options.weatherParameter,

            parameterValue:
                options.parameterValue,

            threshold:
                options.threshold,

            metadata:
                options.metadata

        };

    }

    /**
     * ================================================================
     * Default Aviation Recipients
     * ================================================================
     */

    static defaultRecipients(): AlertRecipient[] {

        return [

            AlertRecipient.PILOT,

            AlertRecipient.AIR_TRAFFIC_CONTROL,

            AlertRecipient.DISPATCHER,

            AlertRecipient.AIRPORT_OPERATIONS,

            AlertRecipient.METEOROLOGIST

        ];

    }

    /**
     * ================================================================
     * Emergency Recipients
     * ================================================================
     */

    static emergencyRecipients(): AlertRecipient[] {

        return [

            AlertRecipient.PILOT,

            AlertRecipient.AIR_TRAFFIC_CONTROL,

            AlertRecipient.DISPATCHER,

            AlertRecipient.AIRPORT_OPERATIONS,

            AlertRecipient.METEOROLOGIST,

            AlertRecipient.MANAGEMENT,

            AlertRecipient.EMERGENCY_RESPONSE

        ];

    }

    /**
     * ================================================================
     * Add Recipient
     * ================================================================
     */

    static addRecipient(

        recipients: AlertRecipient[],

        recipient: AlertRecipient

    ): AlertRecipient[] {

        if (!recipients.includes(recipient)) {

            recipients.push(recipient);

        }

        return recipients;

    }

    /**
     * ================================================================
     * Remove Recipient
     * ================================================================
     */

    static removeRecipient(

        recipients: AlertRecipient[],

        recipient: AlertRecipient

    ): AlertRecipient[] {

        return recipients.filter(

            r => r !== recipient

        );

    }

    /**
     * ================================================================
     * Is Emergency Alert
     * ================================================================
     */

    static isEmergency(

        severity: AlertSeverity

    ): boolean {

        return severity === AlertSeverity.EMERGENCY;

    }

    /**
     * ================================================================
     * Is Warning
     * ================================================================
     */

    static isWarning(

        severity: AlertSeverity

    ): boolean {

        return (

            severity === AlertSeverity.WARNING ||

            severity === AlertSeverity.EMERGENCY

        );

    }

}