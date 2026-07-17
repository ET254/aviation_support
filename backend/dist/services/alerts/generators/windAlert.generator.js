"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindAlertGenerator = void 0;
const wind_rules_1 = require("../../decisionSupport/rules/wind.rules");
const alertFormatter_1 = require("../formatters/alertFormatter");
const AlertModel_1 = require("../models/AlertModel");
const AlertPriority_1 = require("../models/AlertPriority");
const AlertSeverity_1 = require("../models/AlertSeverity");
class WindAlertGenerator {
    static generate(weather) {
        const wind = wind_rules_1.WindRules.evaluate(weather);
        if (wind.score <= 0) {
            return null;
        }
        let severity;
        if (wind.score < 20)
            severity = AlertSeverity_1.AlertSeverity.INFORMATION;
        else if (wind.score < 40)
            severity = AlertSeverity_1.AlertSeverity.ADVISORY;
        else if (wind.score < 60)
            severity = AlertSeverity_1.AlertSeverity.WATCH;
        else if (wind.score < 80)
            severity = AlertSeverity_1.AlertSeverity.WARNING;
        else
            severity = AlertSeverity_1.AlertSeverity.EMERGENCY;
        let priority;
        if (wind.score < 20)
            priority = AlertPriority_1.AlertPriority.LOW;
        else if (wind.score < 40)
            priority = AlertPriority_1.AlertPriority.NORMAL;
        else if (wind.score < 60)
            priority = AlertPriority_1.AlertPriority.HIGH;
        else if (wind.score < 80)
            priority = AlertPriority_1.AlertPriority.URGENT;
        else
            priority = AlertPriority_1.AlertPriority.IMMEDIATE;
        return alertFormatter_1.AlertFormatter.create({
            stationId: weather.stationId,
            stationCode: weather.stationCode,
            stationName: weather.stationName,
            category: AlertModel_1.AlertCategory.WIND,
            severity,
            priority,
            title: "Adverse Wind Conditions",
            summary: "Operational wind limits exceeded.",
            message: `${wind.operationalStatus}. ${wind.pilotMessage}`,
            hazard: "Strong winds, gusts or crosswind conditions may affect flight operations.",
            operationalImpact: wind.runwayRecommendation,
            recommendedActions: wind.recommendations,
            riskScore: wind.score,
            confidence: weather.confidence,
            source: "Wind Rule Engine",
            weatherParameter: "Wind",
            parameterValue: weather.windSpeed,
            metadata: {
                windDirection: wind.windDirection,
                windSpeed: wind.windSpeed,
                gust: wind.gust,
                crosswind: wind.crosswind,
                headwind: wind.headwind,
                tailwind: wind.tailwind,
                runwayRecommendation: wind.runwayRecommendation,
                operationalStatus: wind.operationalStatus,
                severity: wind.severity
            }
        });
    }
}
exports.WindAlertGenerator = WindAlertGenerator;
//# sourceMappingURL=windAlert.generator.js.map