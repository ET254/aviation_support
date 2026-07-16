"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertUtils = void 0;
const AlertModel_1 = require("../models/AlertModel");
const AlertSeverity_1 = require("../models/AlertSeverity");
const AlertPriority_1 = require("../models/AlertPriority");
class AlertUtils {
    static sort(alerts) {
        return [...alerts].sort((a, b) => {
            const severity = this.severityWeight(b.severity) -
                this.severityWeight(a.severity);
            if (severity !== 0)
                return severity;
            const priority = this.priorityWeight(b.priority) -
                this.priorityWeight(a.priority);
            if (priority !== 0)
                return priority;
            const risk = (b.riskScore ?? 0) -
                (a.riskScore ?? 0);
            if (risk !== 0)
                return risk;
            return (b.issuedAt.getTime() -
                a.issuedAt.getTime());
        });
    }
    static active(alerts) {
        return alerts.filter(alert => alert.status === AlertModel_1.AlertStatus.ACTIVE);
    }
    static byCategory(alerts, category) {
        return alerts.filter(alert => alert.category === category);
    }
    static bySeverity(alerts, severity) {
        return alerts.filter(alert => alert.severity === severity);
    }
    static byPriority(alerts, priority) {
        return alerts.filter(alert => alert.priority === priority);
    }
    static highestSeverity(alerts) {
        return this.sort(alerts)[0];
    }
    static highestRisk(alerts) {
        if (alerts.length === 0)
            return undefined;
        return [...alerts].sort((a, b) => (b.riskScore ?? 0) -
            (a.riskScore ?? 0))[0];
    }
    static groupByCategory(alerts) {
        const groups = {};
        for (const alert of alerts) {
            if (!groups[alert.category]) {
                groups[alert.category] = [];
            }
            groups[alert.category].push(alert);
        }
        return groups;
    }
    static groupBySeverity(alerts) {
        const groups = {};
        for (const alert of alerts) {
            if (!groups[alert.severity]) {
                groups[alert.severity] = [];
            }
            groups[alert.severity].push(alert);
        }
        return groups;
    }
    static countActive(alerts) {
        return this.active(alerts).length;
    }
    static countCategory(alerts, category) {
        return this.byCategory(alerts, category).length;
    }
    static countSeverity(alerts, severity) {
        return this.bySeverity(alerts, severity).length;
    }
    static severityWeight(severity) {
        switch (severity) {
            case AlertSeverity_1.AlertSeverity.EMERGENCY:
                return 5;
            case AlertSeverity_1.AlertSeverity.WARNING:
                return 4;
            case AlertSeverity_1.AlertSeverity.WATCH:
                return 3;
            case AlertSeverity_1.AlertSeverity.ADVISORY:
                return 2;
            case AlertSeverity_1.AlertSeverity.INFORMATION:
                return 1;
            default:
                return 0;
        }
    }
    static priorityWeight(priority) {
        switch (priority) {
            case AlertPriority_1.AlertPriority.IMMEDIATE:
                return 5;
            case AlertPriority_1.AlertPriority.URGENT:
                return 4;
            case AlertPriority_1.AlertPriority.HIGH:
                return 3;
            case AlertPriority_1.AlertPriority.NORMAL:
                return 2;
            case AlertPriority_1.AlertPriority.LOW:
                return 1;
            default:
                return 0;
        }
    }
}
exports.AlertUtils = AlertUtils;
//# sourceMappingURL=alertUtils.js.map