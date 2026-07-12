import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";

import { TurbulenceRules } from "../../decisionSupport/rules/turbulence.rules";

import { AlertFormatter } from "../formatters/alertFormatter";

import { AlertCategory } from "../models/AlertModel";
import { AlertPriority } from "../models/AlertPriority";
import { AlertSeverity } from "../models/AlertSeverity";

/**
 * ============================================================================
 * Turbulence Alert Generator
 * ============================================================================
 */

export class TurbulenceAlertGenerator {

    /**
     * =========================================================================
     * Generate Turbulence Alert
     * =========================================================================
     */

    static generate(
        weather: CanonicalWeatherObservation
    ) {

        const turbulence =
            TurbulenceRules.evaluate(weather);

        //---------------------------------------------------------
        // No alert
        //---------------------------------------------------------

        if (turbulence.score <= 0) {

            return null;

        }

        //---------------------------------------------------------
        // Severity
        //---------------------------------------------------------

        let severity: AlertSeverity;

        if (turbulence.score < 20)
            severity = AlertSeverity.INFORMATION;

        else if (turbulence.score < 40)
            severity = AlertSeverity.ADVISORY;

        else if (turbulence.score < 60)
            severity = AlertSeverity.WATCH;

        else if (turbulence.score < 80)
            severity = AlertSeverity.WARNING;

        else
            severity = AlertSeverity.EMERGENCY;

        //---------------------------------------------------------
        // Priority
        //---------------------------------------------------------

        let priority: AlertPriority;

        if (turbulence.score < 20)
            priority = AlertPriority.LOW;

        else if (turbulence.score < 40)
            priority = AlertPriority.NORMAL;

        else if (turbulence.score < 60)
            priority = AlertPriority.HIGH;

        else if (turbulence.score < 80)
            priority = AlertPriority.URGENT;

        else
            priority = AlertPriority.IMMEDIATE;

        //---------------------------------------------------------
        // Build Alert
        //---------------------------------------------------------

        return AlertFormatter.create({

            stationId:
                weather.stationId,

            stationCode:
                weather.stationCode,

            stationName:
                weather.stationName,

            category:
                AlertCategory.TURBULENCE,

            severity,

            priority,

            title:
                "Turbulence Hazard",

            summary:
                "Atmospheric turbulence detected.",

            message:
                `${turbulence.operationalStatus}. ${turbulence.pilotMessage}`,

            hazard:
                "Moderate to severe turbulence may affect aircraft handling and passenger safety.",

            operationalImpact:
                turbulence.airportMessage,

            recommendedActions:
                turbulence.recommendations,

            riskScore:
                turbulence.score,

            confidence:
                weather.confidence,

            source:
                "Turbulence Rule Engine",

            weatherParameter:
                "Turbulence",

            parameterValue:
                weather.turbulenceSeverity,

            metadata: {

                turbulence:
                    weather.turbulence,

                turbulenceSeverity:
                    weather.turbulenceSeverity,

                turbulenceBase:
                    weather.turbulenceBase,

                turbulenceTop:
                    weather.turbulenceTop,

                clearAirTurbulence:
                    weather.clearAirTurbulence,

                mountainWave:
                    weather.mountainWave,

                rotorCloud:
                    weather.rotorCloud,

                operationalStatus:
                    turbulence.operationalStatus,

                severity:
                    turbulence.severity

            }

        });

    }

}