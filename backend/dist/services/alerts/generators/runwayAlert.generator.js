"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunwayAlertGenerator = void 0;
const runway_rules_1 = require("../../decisionSupport/rules/runway.rules");
const alertFormatter_1 = require("../formatters/alertFormatter");
const AlertModel_1 = require("../models/AlertModel");
const AlertPriority_1 = require("../models/AlertPriority");
const AlertSeverity_1 = require("../models/AlertSeverity");
class RunwayAlertGenerator {
    static generate(weather) {
        const runway = runway_rules_1.RunwayRules.evaluate(weather);
        if (runway.score <= 0) {
            return null;
        }
        let severity;
        if (runway.score < 20)
            severity = AlertSeverity_1.AlertSeverity.INFORMATION;
        else if (runway.score < 40)
            severity = AlertSeverity_1.AlertSeverity.ADVISORY;
        else if (runway.score < 60)
            severity = AlertSeverity_1.AlertSeverity.WATCH;
        else if (runway.score < 80)
            severity = AlertSeverity_1.AlertSeverity.WARNING;
        else
            severity = AlertSeverity_1.AlertSeverity.EMERGENCY;
        let priority;
        if (runway.score < 20)
            priority = AlertPriority_1.AlertPriority.LOW;
        else if (runway.score < 40)
            priority = AlertPriority_1.AlertPriority.NORMAL;
        else if (runway.score < 60)
            priority = AlertPriority_1.AlertPriority.HIGH;
        else if (runway.score < 80)
            priority = AlertPriority_1.AlertPriority.URGENT;
        else
            priority = AlertPriority_1.AlertPriority.IMMEDIATE;
        return alertFormatter_1.AlertFormatter.create({
            stationId: weather.stationId,
            stationCode: weather.stationCode,
            stationName: weather.stationName,
            category: AlertModel_1.AlertCategory.RUNWAY,
            severity,
            priority,
            title: "Runway Operational Hazard",
            summary: "Runway condition requires operational attention.",
            message: `${runway.operationalStatus}. ${runway.pilotMessage}`,
            hazard: "Runway contamination or braking performance may affect aircraft operations.",
            operationalImpact: runway.airportMessage,
            recommendedActions: runway.recommendations,
            riskScore: runway.score,
            confidence: weather.confidence,
            source: "Runway Rule Engine",
            weatherParameter: "Runway Condition",
            parameterValue: weather.runwayCondition,
            metadata: {
                runwayCondition: weather.runwayCondition,
                brakingAction: weather.brakingAction,
                contamination: weather.runwayContaminationPercent,
                friction: weather.runwayFrictionCoefficient,
                standingWater: weather.standingWater,
                snowDepth: weather.snowDepth,
                slushDepth: weather.slushDepth,
                operationalStatus: runway.operationalStatus,
                severity: runway.severity
            }
        });
    }
}
exports.RunwayAlertGenerator = RunwayAlertGenerator;
//# sourceMappingURL=runwayAlert.generator.js.map