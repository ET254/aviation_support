"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThunderstormAlertGenerator = void 0;
const thunderstorm_rules_1 = require("../../decisionSupport/rules/thunderstorm.rules");
const alertFormatter_1 = require("../formatters/alertFormatter");
const AlertModel_1 = require("../models/AlertModel");
const AlertPriority_1 = require("../models/AlertPriority");
const AlertSeverity_1 = require("../models/AlertSeverity");
class ThunderstormAlertGenerator {
    static generate(weather) {
        const storm = thunderstorm_rules_1.ThunderstormRules.evaluate(weather);
        if (storm.score <= 0) {
            return null;
        }
        let severity;
        if (storm.score < 20)
            severity = AlertSeverity_1.AlertSeverity.INFORMATION;
        else if (storm.score < 40)
            severity = AlertSeverity_1.AlertSeverity.ADVISORY;
        else if (storm.score < 60)
            severity = AlertSeverity_1.AlertSeverity.WATCH;
        else if (storm.score < 80)
            severity = AlertSeverity_1.AlertSeverity.WARNING;
        else
            severity = AlertSeverity_1.AlertSeverity.EMERGENCY;
        let priority;
        if (storm.score < 20)
            priority = AlertPriority_1.AlertPriority.LOW;
        else if (storm.score < 40)
            priority = AlertPriority_1.AlertPriority.NORMAL;
        else if (storm.score < 60)
            priority = AlertPriority_1.AlertPriority.HIGH;
        else if (storm.score < 80)
            priority = AlertPriority_1.AlertPriority.URGENT;
        else
            priority = AlertPriority_1.AlertPriority.IMMEDIATE;
        return alertFormatter_1.AlertFormatter.create({
            stationId: weather.stationId,
            stationCode: weather.stationCode,
            stationName: weather.stationName,
            category: AlertModel_1.AlertCategory.THUNDERSTORM,
            severity,
            priority,
            title: "Thunderstorm Hazard",
            summary: "Convective weather poses a significant operational risk.",
            message: `${storm.operationalStatus}. ${storm.pilotMessage}`,
            hazard: "Thunderstorms may produce lightning, hail, severe turbulence, wind shear and microbursts.",
            operationalImpact: storm.airportMessage,
            recommendedActions: storm.recommendations,
            riskScore: storm.score,
            confidence: weather.confidence,
            source: "Thunderstorm Rule Engine",
            weatherParameter: "Thunderstorm",
            parameterValue: weather.thunderstorm
                ? "Present"
                : "None",
            metadata: {
                thunderstorm: weather.thunderstorm,
                lightning: weather.lightning,
                hail: weather.hail,
                cumulonimbus: weather.cumulonimbus,
                toweringCumulus: weather.toweringCumulus,
                squall: weather.squall,
                tornado: weather.tornado,
                funnelCloud: weather.funnelCloud,
                windShear: weather.lowLevelWindShear,
                operationalStatus: storm.operationalStatus,
                severity: storm.severity
            }
        });
    }
}
exports.ThunderstormAlertGenerator = ThunderstormAlertGenerator;
//# sourceMappingURL=thunderstormAlert.generator.js.map