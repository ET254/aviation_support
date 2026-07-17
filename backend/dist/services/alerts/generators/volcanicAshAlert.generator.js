"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolcanicAshAlertGenerator = void 0;
const volcanicAsh_rules_1 = require("../../decisionSupport/rules/volcanicAsh.rules");
const alertFormatter_1 = require("../formatters/alertFormatter");
const AlertModel_1 = require("../models/AlertModel");
const AlertPriority_1 = require("../models/AlertPriority");
const AlertSeverity_1 = require("../models/AlertSeverity");
class VolcanicAshAlertGenerator {
    static generate(weather) {
        const ash = volcanicAsh_rules_1.VolcanicAshRules.evaluate(weather);
        if (ash.score <= 0) {
            return null;
        }
        let severity;
        if (ash.score < 20)
            severity = AlertSeverity_1.AlertSeverity.INFORMATION;
        else if (ash.score < 40)
            severity = AlertSeverity_1.AlertSeverity.ADVISORY;
        else if (ash.score < 60)
            severity = AlertSeverity_1.AlertSeverity.WATCH;
        else if (ash.score < 80)
            severity = AlertSeverity_1.AlertSeverity.WARNING;
        else
            severity = AlertSeverity_1.AlertSeverity.EMERGENCY;
        let priority;
        if (ash.score < 20)
            priority = AlertPriority_1.AlertPriority.LOW;
        else if (ash.score < 40)
            priority = AlertPriority_1.AlertPriority.NORMAL;
        else if (ash.score < 60)
            priority = AlertPriority_1.AlertPriority.HIGH;
        else if (ash.score < 80)
            priority = AlertPriority_1.AlertPriority.URGENT;
        else
            priority = AlertPriority_1.AlertPriority.IMMEDIATE;
        return alertFormatter_1.AlertFormatter.create({
            stationId: weather.stationId,
            stationCode: weather.stationCode,
            stationName: weather.stationName,
            category: AlertModel_1.AlertCategory.VOLCANIC_ASH,
            severity,
            priority,
            title: "Volcanic Ash Hazard",
            summary: "Volcanic ash detected within operational airspace.",
            message: `${ash.operationalStatus}. ${ash.pilotMessage}`,
            hazard: "Volcanic ash may cause engine failure, abrasion of aircraft surfaces, contamination of sensors and reduced visibility.",
            operationalImpact: ash.airportMessage,
            recommendedActions: ash.recommendations,
            riskScore: ash.score,
            confidence: weather.confidence,
            source: "Volcanic Ash Rule Engine",
            weatherParameter: "Volcanic Ash",
            parameterValue: weather.volcanicAsh
                ? "Present"
                : "None",
            metadata: {
                volcanicAsh: weather.volcanicAsh,
                sigmetActive: weather.sigmetActive,
                visibility: weather.visibility,
                windDirection: weather.windDirection,
                windSpeed: weather.windSpeed,
                operationalStatus: ash.operationalStatus,
                severity: ash.severity
            }
        });
    }
}
exports.VolcanicAshAlertGenerator = VolcanicAshAlertGenerator;
//# sourceMappingURL=volcanicAshAlert.generator.js.map