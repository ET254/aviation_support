"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DensityAltitudeAlertGenerator = void 0;
const densityAltitude_rules_1 = require("../../decisionSupport/rules/densityAltitude.rules");
const alertFormatter_1 = require("../formatters/alertFormatter");
const AlertModel_1 = require("../models/AlertModel");
const AlertPriority_1 = require("../models/AlertPriority");
const AlertSeverity_1 = require("../models/AlertSeverity");
class DensityAltitudeAlertGenerator {
    static generate(weather) {
        const density = densityAltitude_rules_1.DensityAltitudeRules.evaluate(weather);
        if (density.score <= 0) {
            return null;
        }
        let severity;
        if (density.score < 20)
            severity = AlertSeverity_1.AlertSeverity.INFORMATION;
        else if (density.score < 40)
            severity = AlertSeverity_1.AlertSeverity.ADVISORY;
        else if (density.score < 60)
            severity = AlertSeverity_1.AlertSeverity.WATCH;
        else if (density.score < 80)
            severity = AlertSeverity_1.AlertSeverity.WARNING;
        else
            severity = AlertSeverity_1.AlertSeverity.EMERGENCY;
        let priority;
        if (density.score < 20)
            priority = AlertPriority_1.AlertPriority.LOW;
        else if (density.score < 40)
            priority = AlertPriority_1.AlertPriority.NORMAL;
        else if (density.score < 60)
            priority = AlertPriority_1.AlertPriority.HIGH;
        else if (density.score < 80)
            priority = AlertPriority_1.AlertPriority.URGENT;
        else
            priority = AlertPriority_1.AlertPriority.IMMEDIATE;
        return alertFormatter_1.AlertFormatter.create({
            stationId: weather.stationId,
            stationCode: weather.stationCode,
            stationName: weather.stationName,
            category: AlertModel_1.AlertCategory.DENSITY_ALTITUDE,
            severity,
            priority,
            title: "High Density Altitude",
            summary: "Aircraft performance may be significantly reduced.",
            message: `${density.operationalStatus}. ${density.pilotMessage}`,
            hazard: "High density altitude reduces engine power, climb performance and aircraft lift.",
            operationalImpact: density.airportMessage,
            recommendedActions: density.recommendations,
            riskScore: density.score,
            confidence: weather.confidence,
            source: "Density Altitude Rule Engine",
            weatherParameter: "Density Altitude",
            parameterValue: weather.densityAltitude ?? 0,
            metadata: {
                densityAltitude: weather.densityAltitude,
                pressureAltitude: weather.pressureAltitude,
                elevation: weather.elevation,
                temperature: weather.temperature,
                qnh: weather.qnh,
                operationalStatus: density.operationalStatus,
                severity: density.severity
            }
        });
    }
}
exports.DensityAltitudeAlertGenerator = DensityAltitudeAlertGenerator;
//# sourceMappingURL=densityAltitudeAlert.generator.js.map