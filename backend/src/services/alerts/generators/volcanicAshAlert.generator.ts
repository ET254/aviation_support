import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";

import { VolcanicAshRules } from "../../decisionSupport/rules/volcanicAsh.rules";

import { AlertFormatter } from "../formatters/alertFormatter";

import { AlertCategory } from "../models/AlertModel";
import { AlertPriority } from "../models/AlertPriority";
import { AlertSeverity } from "../models/AlertSeverity";

/**
 * ============================================================================
 * Volcanic Ash Alert Generator
 * ============================================================================
 */

export class VolcanicAshAlertGenerator {

    /**
     * =========================================================================
     * Generate Volcanic Ash Alert
     * =========================================================================
     */

    static generate(
        weather: CanonicalWeatherObservation
    ) {

        const ash =
            VolcanicAshRules.evaluate(weather);

        //---------------------------------------------------------
        // No alert
        //---------------------------------------------------------

        if (ash.score <= 0) {

            return null;

        }

        //---------------------------------------------------------
        // Severity
        //---------------------------------------------------------

        let severity: AlertSeverity;

        if (ash.score < 20)
            severity = AlertSeverity.INFORMATION;

        else if (ash.score < 40)
            severity = AlertSeverity.ADVISORY;

        else if (ash.score < 60)
            severity = AlertSeverity.WATCH;

        else if (ash.score < 80)
            severity = AlertSeverity.WARNING;

        else
            severity = AlertSeverity.EMERGENCY;

        //---------------------------------------------------------
        // Priority
        //---------------------------------------------------------

        let priority: AlertPriority;

        if (ash.score < 20)
            priority = AlertPriority.LOW;

        else if (ash.score < 40)
            priority = AlertPriority.NORMAL;

        else if (ash.score < 60)
            priority = AlertPriority.HIGH;

        else if (ash.score < 80)
            priority = AlertPriority.URGENT;

        else
            priority = AlertPriority.IMMEDIATE;

        //---------------------------------------------------------
        // Alert
        //---------------------------------------------------------

        return AlertFormatter.create({

            stationId:
                weather.stationId,

            stationCode:
                weather.stationCode,

            stationName:
                weather.stationName,

            category:
                AlertCategory.VOLCANIC_ASH,

            severity,

            priority,

            title:
                "Volcanic Ash Hazard",

            summary:
                "Volcanic ash detected within operational airspace.",

            message:
                `${ash.operationalStatus}. ${ash.pilotMessage}`,

            hazard:
                "Volcanic ash may cause engine failure, abrasion of aircraft surfaces, contamination of sensors and reduced visibility.",

            operationalImpact:
                ash.airportMessage,

            recommendedActions:
                ash.recommendations,

            riskScore:
                ash.score,

            confidence:
                weather.confidence,

            source:
                "Volcanic Ash Rule Engine",

            weatherParameter:
                "Volcanic Ash",

            parameterValue:
                weather.volcanicAsh
                    ? "Present"
                    : "None",

            metadata: {

                volcanicAsh:
                    weather.volcanicAsh,

                sigmetActive:
                    weather.sigmetActive,

                visibility:
                    weather.visibility,

                windDirection:
                    weather.windDirection,

                windSpeed:
                    weather.windSpeed,

                operationalStatus:
                    ash.operationalStatus,

                severity:
                    ash.severity

            }

        });

    }

}