"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertFormatter = void 0;
const crypto_1 = require("crypto");
const AlertModel_1 = require("../models/AlertModel");
const AlertRecipient_1 = require("../models/AlertRecipient");
const AlertSeverity_1 = require("../models/AlertSeverity");
class AlertFormatter {
    static create(options) {
        const now = new Date();
        return {
            id: (0, crypto_1.randomUUID)(),
            stationId: options.stationId,
            stationCode: options.stationCode,
            stationName: options.stationName,
            category: options.category,
            severity: options.severity,
            priority: options.priority,
            status: AlertModel_1.AlertStatus.ACTIVE,
            title: options.title,
            message: options.message,
            summary: options.summary,
            hazard: options.hazard,
            operationalImpact: options.operationalImpact,
            recommendedActions: options.recommendedActions ?? [],
            recipients: options.recipients ?? [],
            riskScore: options.riskScore,
            confidence: options.confidence,
            issuedAt: now,
            validFrom: options.validFrom ?? now,
            validTo: options.validTo,
            expiresAt: options.expiresAt,
            source: options.source ?? "Decision Support Engine",
            weatherParameter: options.weatherParameter,
            parameterValue: options.parameterValue,
            threshold: options.threshold,
            metadata: options.metadata
        };
    }
    static defaultRecipients() {
        return [
            AlertRecipient_1.AlertRecipient.PILOT,
            AlertRecipient_1.AlertRecipient.AIR_TRAFFIC_CONTROL,
            AlertRecipient_1.AlertRecipient.DISPATCHER,
            AlertRecipient_1.AlertRecipient.AIRPORT_OPERATIONS,
            AlertRecipient_1.AlertRecipient.METEOROLOGIST
        ];
    }
    static emergencyRecipients() {
        return [
            AlertRecipient_1.AlertRecipient.PILOT,
            AlertRecipient_1.AlertRecipient.AIR_TRAFFIC_CONTROL,
            AlertRecipient_1.AlertRecipient.DISPATCHER,
            AlertRecipient_1.AlertRecipient.AIRPORT_OPERATIONS,
            AlertRecipient_1.AlertRecipient.METEOROLOGIST,
            AlertRecipient_1.AlertRecipient.MANAGEMENT,
            AlertRecipient_1.AlertRecipient.EMERGENCY_RESPONSE
        ];
    }
    static addRecipient(recipients, recipient) {
        if (!recipients.includes(recipient)) {
            recipients.push(recipient);
        }
        return recipients;
    }
    static removeRecipient(recipients, recipient) {
        return recipients.filter(r => r !== recipient);
    }
    static isEmergency(severity) {
        return severity === AlertSeverity_1.AlertSeverity.EMERGENCY;
    }
    static isWarning(severity) {
        return (severity === AlertSeverity_1.AlertSeverity.WARNING ||
            severity === AlertSeverity_1.AlertSeverity.EMERGENCY);
    }
}
exports.AlertFormatter = AlertFormatter;
//# sourceMappingURL=alertFormatter.js.map