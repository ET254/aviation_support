"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudAlertGenerator = void 0;
const cloud_rules_1 = require("../../decisionSupport/rules/cloud.rules");
const alertFormatter_1 = require("../formatters/alertFormatter");
const AlertModel_1 = require("../models/AlertModel");
const AlertPriority_1 = require("../models/AlertPriority");
const AlertSeverity_1 = require("../models/AlertSeverity");
class CloudAlertGenerator {
    static generate(weather) {
        const cloud = cloud_rules_1.CloudRules.evaluate(weather);
        if (cloud.score <= 0) {
            return null;
        }
        let severity;
        if (cloud.score < 20)
            severity = AlertSeverity_1.AlertSeverity.INFORMATION;
        else if (cloud.score < 40)
            severity = AlertSeverity_1.AlertSeverity.ADVISORY;
        else if (cloud.score < 60)
            severity = AlertSeverity_1.AlertSeverity.WATCH;
        else if (cloud.score < 80)
            severity = AlertSeverity_1.AlertSeverity.WARNING;
        else
            severity = AlertSeverity_1.AlertSeverity.EMERGENCY;
        let priority;
        if (cloud.score < 20)
            priority = AlertPriority_1.AlertPriority.LOW;
        else if (cloud.score < 40)
            priority = AlertPriority_1.AlertPriority.NORMAL;
        else if (cloud.score < 60)
            priority = AlertPriority_1.AlertPriority.HIGH;
        else if (cloud.score < 80)
            priority = AlertPriority_1.AlertPriority.URGENT;
        else
            priority = AlertPriority_1.AlertPriority.IMMEDIATE;
        return alertFormatter_1.AlertFormatter.create({
            stationId: weather.stationId,
            stationCode: weather.stationCode,
            stationName: weather.stationName,
            category: AlertModel_1.AlertCategory.CLOUD,
            severity,
            priority,
            title: "Cloud and Ceiling Hazard",
            summary: "Cloud conditions may affect aviation operations.",
            message: `${cloud.operationalStatus}. ${cloud.pilotMessage}`,
            hazard: "Low cloud base, ceiling or convective cloud may reduce operational capability.",
            operationalImpact: cloud.airportMessage,
            recommendedActions: cloud.recommendations,
            riskScore: cloud.score,
            confidence: weather.confidence,
            source: "Cloud Rule Engine",
            weatherParameter: "Cloud",
            parameterValue: weather.ceiling,
            metadata: {
                cloudBase: weather.cloudBase,
                cloudTop: weather.cloudTop,
                ceiling: weather.ceiling,
                cloudAmount: weather.cloudAmount,
                cloudType: weather.cloudType,
                convectiveClouds: weather.convectiveClouds,
                cumulonimbus: weather.cumulonimbus,
                toweringCumulus: weather.toweringCumulus,
                operationalStatus: cloud.operationalStatus,
                severity: cloud.severity
            }
        });
    }
}
exports.CloudAlertGenerator = CloudAlertGenerator;
//# sourceMappingURL=cloudAlert.generator.js.map