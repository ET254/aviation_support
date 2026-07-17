"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TurbulenceAlertGenerator = void 0;
const turbulence_rules_1 = require("../../decisionSupport/rules/turbulence.rules");
const alertFormatter_1 = require("../formatters/alertFormatter");
const AlertModel_1 = require("../models/AlertModel");
const AlertPriority_1 = require("../models/AlertPriority");
const AlertSeverity_1 = require("../models/AlertSeverity");
class TurbulenceAlertGenerator {
    static generate(weather) {
        const turbulence = turbulence_rules_1.TurbulenceRules.evaluate(weather);
        if (turbulence.score <= 0) {
            return null;
        }
        let severity;
        if (turbulence.score < 20)
            severity = AlertSeverity_1.AlertSeverity.INFORMATION;
        else if (turbulence.score < 40)
            severity = AlertSeverity_1.AlertSeverity.ADVISORY;
        else if (turbulence.score < 60)
            severity = AlertSeverity_1.AlertSeverity.WATCH;
        else if (turbulence.score < 80)
            severity = AlertSeverity_1.AlertSeverity.WARNING;
        else
            severity = AlertSeverity_1.AlertSeverity.EMERGENCY;
        let priority;
        if (turbulence.score < 20)
            priority = AlertPriority_1.AlertPriority.LOW;
        else if (turbulence.score < 40)
            priority = AlertPriority_1.AlertPriority.NORMAL;
        else if (turbulence.score < 60)
            priority = AlertPriority_1.AlertPriority.HIGH;
        else if (turbulence.score < 80)
            priority = AlertPriority_1.AlertPriority.URGENT;
        else
            priority = AlertPriority_1.AlertPriority.IMMEDIATE;
        return alertFormatter_1.AlertFormatter.create({
            stationId: weather.stationId,
            stationCode: weather.stationCode,
            stationName: weather.stationName,
            category: AlertModel_1.AlertCategory.TURBULENCE,
            severity,
            priority,
            title: "Turbulence Hazard",
            summary: "Atmospheric turbulence detected.",
            message: `${turbulence.operationalStatus}. ${turbulence.pilotMessage}`,
            hazard: "Moderate to severe turbulence may affect aircraft handling and passenger safety.",
            operationalImpact: turbulence.airportMessage,
            recommendedActions: turbulence.recommendations,
            riskScore: turbulence.score,
            confidence: weather.confidence,
            source: "Turbulence Rule Engine",
            weatherParameter: "Turbulence",
            parameterValue: weather.turbulenceSeverity,
            metadata: {
                turbulence: weather.turbulence,
                turbulenceSeverity: weather.turbulenceSeverity,
                turbulenceBase: weather.turbulenceBase,
                turbulenceTop: weather.turbulenceTop,
                clearAirTurbulence: weather.clearAirTurbulence,
                mountainWave: weather.mountainWave,
                rotorCloud: weather.rotorCloud,
                operationalStatus: turbulence.operationalStatus,
                severity: turbulence.severity
            }
        });
    }
}
exports.TurbulenceAlertGenerator = TurbulenceAlertGenerator;
//# sourceMappingURL=turbulenceAlert.generator.js.map