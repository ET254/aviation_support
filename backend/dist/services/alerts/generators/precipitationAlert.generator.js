"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrecipitationAlertGenerator = void 0;
const precipitation_rules_1 = require("../../decisionSupport/rules/precipitation.rules");
const alertFormatter_1 = require("../formatters/alertFormatter");
const AlertModel_1 = require("../models/AlertModel");
const AlertPriority_1 = require("../models/AlertPriority");
const AlertSeverity_1 = require("../models/AlertSeverity");
class PrecipitationAlertGenerator {
    static generate(weather) {
        const precipitation = precipitation_rules_1.PrecipitationRules.evaluate(weather);
        if (precipitation.score <= 0) {
            return null;
        }
        let severity;
        if (precipitation.score < 20)
            severity = AlertSeverity_1.AlertSeverity.INFORMATION;
        else if (precipitation.score < 40)
            severity = AlertSeverity_1.AlertSeverity.ADVISORY;
        else if (precipitation.score < 60)
            severity = AlertSeverity_1.AlertSeverity.WATCH;
        else if (precipitation.score < 80)
            severity = AlertSeverity_1.AlertSeverity.WARNING;
        else
            severity = AlertSeverity_1.AlertSeverity.EMERGENCY;
        let priority;
        if (precipitation.score < 20)
            priority = AlertPriority_1.AlertPriority.LOW;
        else if (precipitation.score < 40)
            priority = AlertPriority_1.AlertPriority.NORMAL;
        else if (precipitation.score < 60)
            priority = AlertPriority_1.AlertPriority.HIGH;
        else if (precipitation.score < 80)
            priority = AlertPriority_1.AlertPriority.URGENT;
        else
            priority = AlertPriority_1.AlertPriority.IMMEDIATE;
        return alertFormatter_1.AlertFormatter.create({
            stationId: weather.stationId,
            stationCode: weather.stationCode,
            stationName: weather.stationName,
            category: AlertModel_1.AlertCategory.PRECIPITATION,
            severity,
            priority,
            title: "Precipitation Hazard",
            summary: "Precipitation may affect aviation operations.",
            message: `${precipitation.operationalStatus}. ${precipitation.pilotMessage}`,
            hazard: "Rain, snow, hail or freezing precipitation may reduce visibility and runway performance.",
            operationalImpact: precipitation.airportMessage,
            recommendedActions: precipitation.recommendations,
            riskScore: precipitation.score,
            confidence: weather.confidence,
            source: "Precipitation Rule Engine",
            weatherParameter: "Precipitation",
            parameterValue: weather.precipitationType ?? "None",
            metadata: {
                type: weather.precipitationType,
                intensity: weather.precipitationIntensity,
                rate: weather.precipitationRate,
                accumulation: weather.accumulation,
                visibility: weather.visibility,
                runwayCondition: weather.runwayCondition,
                operationalStatus: precipitation.operationalStatus,
                severity: precipitation.severity
            }
        });
    }
}
exports.PrecipitationAlertGenerator = PrecipitationAlertGenerator;
//# sourceMappingURL=precipitationAlert.generator.js.map