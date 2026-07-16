"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisibilityAlertGenerator = void 0;
const visibility_rules_1 = require("../../decisionSupport/rules/visibility.rules");
const alertFormatter_1 = require("../formatters/alertFormatter");
const AlertModel_1 = require("../models/AlertModel");
const AlertPriority_1 = require("../models/AlertPriority");
const AlertSeverity_1 = require("../models/AlertSeverity");
class VisibilityAlertGenerator {
    static generate(weather) {
        const visibility = visibility_rules_1.VisibilityRules.evaluate(weather);
        if (visibility.score <= 0) {
            return null;
        }
        let severity;
        if (visibility.score < 20) {
            severity = AlertSeverity_1.AlertSeverity.INFORMATION;
        }
        else if (visibility.score < 40) {
            severity = AlertSeverity_1.AlertSeverity.ADVISORY;
        }
        else if (visibility.score < 60) {
            severity = AlertSeverity_1.AlertSeverity.WATCH;
        }
        else if (visibility.score < 80) {
            severity = AlertSeverity_1.AlertSeverity.WARNING;
        }
        else {
            severity = AlertSeverity_1.AlertSeverity.EMERGENCY;
        }
        let priority;
        if (visibility.score < 20) {
            priority = AlertPriority_1.AlertPriority.LOW;
        }
        else if (visibility.score < 40) {
            priority = AlertPriority_1.AlertPriority.NORMAL;
        }
        else if (visibility.score < 60) {
            priority = AlertPriority_1.AlertPriority.HIGH;
        }
        else if (visibility.score < 80) {
            priority = AlertPriority_1.AlertPriority.URGENT;
        }
        else {
            priority = AlertPriority_1.AlertPriority.IMMEDIATE;
        }
        return alertFormatter_1.AlertFormatter.create({
            stationId: weather.stationId,
            stationCode: weather.stationCode,
            stationName: weather.stationName,
            category: AlertModel_1.AlertCategory.VISIBILITY,
            severity,
            priority,
            title: "Reduced Visibility",
            summary: "Visibility below operational threshold.",
            message: `${visibility.operationalStatus}. ${visibility.pilotMessage}`,
            hazard: "Reduced visibility affecting aviation operations.",
            operationalImpact: "Take-off, landing and taxi operations may be affected.",
            recommendedActions: visibility.recommendations,
            riskScore: visibility.score,
            confidence: weather.confidence,
            source: "Visibility Rule Engine",
            weatherParameter: "Visibility",
            parameterValue: weather.visibility,
            threshold: undefined,
            metadata: {
                category: weather.flightCategory,
                rvr: weather.rvr,
                fog: weather.fog,
                mist: weather.mist,
                haze: weather.haze
            }
        });
    }
}
exports.VisibilityAlertGenerator = VisibilityAlertGenerator;
//# sourceMappingURL=visibilityAlert.generator.js.map