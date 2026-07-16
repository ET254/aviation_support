"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertEngine = void 0;
const visibilityAlert_generator_1 = require("./generators/visibilityAlert.generator");
const windAlert_generator_1 = require("./generators/windAlert.generator");
const runwayAlert_generator_1 = require("./generators/runwayAlert.generator");
const cloudAlert_generator_1 = require("./generators/cloudAlert.generator");
const icingAlert_generator_1 = require("./generators/icingAlert.generator");
const turbulenceAlert_generator_1 = require("./generators/turbulenceAlert.generator");
const thunderstormAlert_generator_1 = require("./generators/thunderstormAlert.generator");
const precipitationAlert_generator_1 = require("./generators/precipitationAlert.generator");
const densityAltitudeAlert_generator_1 = require("./generators/densityAltitudeAlert.generator");
const volcanicAshAlert_generator_1 = require("./generators/volcanicAshAlert.generator");
class AlertEngine {
    static generate(weather) {
        const generatedAlerts = [
            visibilityAlert_generator_1.VisibilityAlertGenerator.generate(weather),
            windAlert_generator_1.WindAlertGenerator.generate(weather),
            runwayAlert_generator_1.RunwayAlertGenerator.generate(weather),
            cloudAlert_generator_1.CloudAlertGenerator.generate(weather),
            icingAlert_generator_1.IcingAlertGenerator.generate(weather),
            turbulenceAlert_generator_1.TurbulenceAlertGenerator.generate(weather),
            thunderstormAlert_generator_1.ThunderstormAlertGenerator.generate(weather),
            precipitationAlert_generator_1.PrecipitationAlertGenerator.generate(weather),
            densityAltitudeAlert_generator_1.DensityAltitudeAlertGenerator.generate(weather),
            volcanicAshAlert_generator_1.VolcanicAshAlertGenerator.generate(weather)
        ];
        const alerts = generatedAlerts.filter((alert) => alert !== null);
        const sortedAlerts = this.sortAlerts(alerts);
        const highest = this.highestSeverity(sortedAlerts);
        const overallRisk = this.calculateOverallRisk(sortedAlerts);
        return {
            stationId: weather.stationId,
            stationCode: weather.stationCode,
            generatedAt: new Date(),
            totalAlerts: sortedAlerts.length,
            alerts: sortedAlerts,
            highestSeverity: highest?.severity,
            highestPriority: highest?.priority,
            overallOperationalStatus: this.overallStatus(sortedAlerts),
            overallRiskScore: overallRisk,
            summary: this.executiveSummary(weather.stationCode, sortedAlerts, overallRisk),
            statistics: {
                emergency: this.countBySeverity(sortedAlerts, "EMERGENCY"),
                warning: this.countBySeverity(sortedAlerts, "WARNING"),
                watch: this.countBySeverity(sortedAlerts, "WATCH"),
                advisory: this.countBySeverity(sortedAlerts, "ADVISORY"),
                information: this.countBySeverity(sortedAlerts, "INFORMATION")
            }
        };
    }
    static sortAlerts(alerts) {
        const unique = this.removeDuplicates(alerts);
        return unique.sort((a, b) => {
            const severityDifference = this.severityWeight(b.severity) -
                this.severityWeight(a.severity);
            if (severityDifference !== 0)
                return severityDifference;
            const priorityDifference = this.priorityWeight(b.priority) -
                this.priorityWeight(a.priority);
            if (priorityDifference !== 0)
                return priorityDifference;
            const scoreDifference = (b.riskScore ?? 0) -
                (a.riskScore ?? 0);
            if (scoreDifference !== 0)
                return scoreDifference;
            return (b.issuedAt.getTime() -
                a.issuedAt.getTime());
        });
    }
    static removeDuplicates(alerts) {
        const map = new Map();
        for (const alert of alerts) {
            const key = `${alert.stationId}-${alert.category}`;
            const existing = map.get(key);
            if (!existing) {
                map.set(key, alert);
                continue;
            }
            if ((alert.riskScore ?? 0) >
                (existing.riskScore ?? 0)) {
                map.set(key, alert);
            }
        }
        return [...map.values()];
    }
    static severityWeight(severity) {
        switch (severity) {
            case "EMERGENCY":
                return 5;
            case "WARNING":
                return 4;
            case "WATCH":
                return 3;
            case "ADVISORY":
                return 2;
            case "INFORMATION":
                return 1;
            default:
                return 0;
        }
    }
    static priorityWeight(priority) {
        switch (priority) {
            case "IMMEDIATE":
                return 5;
            case "URGENT":
                return 4;
            case "HIGH":
                return 3;
            case "NORMAL":
                return 2;
            case "LOW":
                return 1;
            default:
                return 0;
        }
    }
    static highestSeverity(alerts) {
        if (alerts.length === 0)
            return undefined;
        return this.sortAlerts(alerts)[0];
    }
    static countBySeverity(alerts, severity) {
        return alerts.filter(alert => alert.severity === severity).length;
    }
    static countByCategory(alerts, category) {
        return alerts.filter(alert => alert.category === category).length;
    }
    static overallStatus(alerts) {
        if (alerts.length === 0)
            return "NORMAL";
        if (alerts.some(a => a.severity === "EMERGENCY"))
            return "CRITICAL";
        if (alerts.some(a => a.severity === "WARNING"))
            return "RESTRICTED";
        if (alerts.some(a => a.severity === "WATCH"))
            return "CAUTION";
        return "NORMAL";
    }
    static calculateOverallRisk(alerts) {
        if (alerts.length === 0)
            return 0;
        const total = alerts.reduce((sum, alert) => sum + (alert.riskScore ?? 0), 0);
        return Number((total / alerts.length)
            .toFixed(1));
    }
    static executiveSummary(stationCode, alerts, risk) {
        if (alerts.length === 0) {
            return `${stationCode}: No operational weather hazards detected.`;
        }
        const highest = alerts[0];
        return `${stationCode}: ${alerts.length} active aviation alert(s). Highest severity is ${highest.severity}. Overall operational risk score is ${risk}.`;
    }
    static criticalAlerts(alerts) {
        return alerts.filter(alert => alert.severity === "WARNING" ||
            alert.severity === "EMERGENCY").length;
    }
    static requiresImmediateAction(alerts) {
        return alerts.some(alert => alert.priority === "IMMEDIATE" ||
            alert.priority === "URGENT");
    }
    static groupByCategory(alerts) {
        const grouped = {};
        for (const alert of alerts) {
            if (!grouped[alert.category]) {
                grouped[alert.category] = [];
            }
            grouped[alert.category].push(alert);
        }
        return grouped;
    }
    static groupBySeverity(alerts) {
        const grouped = {};
        for (const alert of alerts) {
            if (!grouped[alert.severity]) {
                grouped[alert.severity] = [];
            }
            grouped[alert.severity].push(alert);
        }
        return grouped;
    }
    static immediateAlerts(alerts) {
        return alerts.filter(alert => alert.priority === "IMMEDIATE" ||
            alert.priority === "URGENT");
    }
    static dashboardCards(alerts) {
        return alerts.map(alert => ({
            id: alert.id,
            title: alert.title,
            category: alert.category,
            severity: alert.severity,
            priority: alert.priority,
            station: alert.stationCode,
            summary: alert.summary,
            riskScore: alert.riskScore,
            issuedAt: alert.issuedAt
        }));
    }
    static notificationPayload(alerts) {
        return alerts.map(alert => ({
            id: alert.id,
            station: alert.stationCode,
            title: alert.title,
            severity: alert.severity,
            priority: alert.priority,
            summary: alert.summary,
            message: alert.message,
            recommendedActions: alert.recommendedActions
        }));
    }
    static async persistAlerts(alerts) {
        try {
            const { prisma } = await import('../../utils/prisma.js');
            const systemUserId = process.env.SYSTEM_USER_ID;
            if (!systemUserId) {
                console.warn('[AlertEngine] No SYSTEM_USER_ID set; alerts will not be persisted to DB. Set SYSTEM_USER_ID env var to enable persistence.');
                return;
            }
            const severityMap = {
                EMERGENCY: 'CRITICAL',
                WARNING: 'SEVERE',
                WATCH: 'RESTRICTED',
                ADVISORY: 'CAUTION',
                INFORMATION: 'MONITOR'
            };
            const createMany = alerts.map(a => ({
                id: a.id,
                userId: systemUserId,
                type: 'WEATHER',
                message: a.message ?? a.summary ?? a.title,
                severity: (severityMap[a.severity] ?? 'MONITOR'),
                expiresAt: a.validTo ?? undefined
            }));
            await prisma.alert.createMany({ data: createMany, skipDuplicates: true });
        }
        catch (err) {
            console.error('[AlertEngine] persistAlerts error', err);
        }
    }
    static async dispatchAlerts(alerts) {
        try {
            const { NotificationDispatcher } = await import('./dispatch/notificationDispatcher.js');
            if (NotificationDispatcher && typeof NotificationDispatcher.dispatchMany === 'function') {
                await NotificationDispatcher.dispatchMany(alerts);
            }
            else if (NotificationDispatcher && typeof NotificationDispatcher.dispatch === 'function') {
                await NotificationDispatcher.dispatch(alerts);
            }
        }
        catch (err) {
            console.error('[AlertEngine] dispatchAlerts error', err);
        }
    }
    static audit(alerts) {
        console.info(`[AlertEngine] Generated ${alerts.length} alert(s).`);
    }
}
exports.AlertEngine = AlertEngine;
//# sourceMappingURL=AlertEngine.service.js.map