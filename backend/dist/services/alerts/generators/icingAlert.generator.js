"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IcingAlertGenerator = void 0;
const icing_rules_1 = require("../../decisionSupport/rules/icing.rules");
const alertFormatter_1 = require("../formatters/alertFormatter");
const AlertModel_1 = require("../models/AlertModel");
const AlertPriority_1 = require("../models/AlertPriority");
const AlertSeverity_1 = require("../models/AlertSeverity");
class IcingAlertGenerator {
    static generate(weather) {
        const icing = icing_rules_1.IcingRules.evaluate(weather);
        if (icing.score <= 0) {
            return null;
        }
        let severity;
        if (icing.score < 20)
            severity = AlertSeverity_1.AlertSeverity.INFORMATION;
        else if (icing.score < 40)
            severity = AlertSeverity_1.AlertSeverity.ADVISORY;
        else if (icing.score < 60)
            severity = AlertSeverity_1.AlertSeverity.WATCH;
        else if (icing.score < 80)
            severity = AlertSeverity_1.AlertSeverity.WARNING;
        else
            severity = AlertSeverity_1.AlertSeverity.EMERGENCY;
        let priority;
        if (icing.score < 20)
            priority = AlertPriority_1.AlertPriority.LOW;
        else if (icing.score < 40)
            priority = AlertPriority_1.AlertPriority.NORMAL;
        else if (icing.score < 60)
            priority = AlertPriority_1.AlertPriority.HIGH;
        else if (icing.score < 80)
            priority = AlertPriority_1.AlertPriority.URGENT;
        else
            priority = AlertPriority_1.AlertPriority.IMMEDIATE;
        return alertFormatter_1.AlertFormatter.create({
            stationId: weather.stationId,
            stationCode: weather.stationCode,
            stationName: weather.stationName,
            category: AlertModel_1.AlertCategory.ICING,
            severity,
            priority,
            title: "Aircraft Icing Hazard",
            summary: "Atmospheric icing conditions detected.",
            message: `${icing.operationalStatus}. ${icing.pilotMessage}`,
            hazard: "Airframe, engine and propeller icing may significantly degrade aircraft performance.",
            operationalImpact: icing.airportMessage,
            recommendedActions: icing.recommendations,
            riskScore: icing.score,
            confidence: weather.confidence,
            source: "Icing Rule Engine",
            weatherParameter: "Icing",
            parameterValue: weather.icingSeverity,
            metadata: {
                icing: weather.icing,
                icingSeverity: weather.icingSeverity,
                icingBase: weather.icingBase,
                icingTop: weather.icingTop,
                freezingRain: weather.freezingRain,
                freezingDrizzle: weather.freezingDrizzle,
                supercooledLiquidWater: weather.supercooledLiquidWater,
                freezingLevel: weather.freezingLevel,
                operationalStatus: icing.operationalStatus,
                severity: icing.severity
            }
        });
    }
}
exports.IcingAlertGenerator = IcingAlertGenerator;
//# sourceMappingURL=icingAlert.generator.js.map