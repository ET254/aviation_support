import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";

import { DensityAltitudeRules } from "../../decisionSupport/rules/densityAltitude.rules";

import { AlertFormatter } from "../formatters/alertFormatter";

import { AlertCategory } from "../models/AlertModel";
import { AlertPriority } from "../models/AlertPriority";
import { AlertSeverity } from "../models/AlertSeverity";

/**
 * ============================================================================
 * Density Altitude Alert Generator
 * ============================================================================
 */

export class DensityAltitudeAlertGenerator {

    /**
     * =========================================================================
     * Generate Density Altitude Alert
     * =========================================================================
     */

    static generate(
        weather: CanonicalWeatherObservation
    ) {

        const density =
            DensityAltitudeRules.evaluate(weather);

        //---------------------------------------------------------
        // No alert
        //---------------------------------------------------------

        if (density.score <= 0) {

            return null;

        }

        //---------------------------------------------------------
        // Severity
        //---------------------------------------------------------

        let severity: AlertSeverity;

        if (density.score < 20)
            severity = AlertSeverity.INFORMATION;

        else if (density.score < 40)
            severity = AlertSeverity.ADVISORY;

        else if (density.score < 60)
            severity = AlertSeverity.WATCH;

        else if (density.score < 80)
            severity = AlertSeverity.WARNING;

        else
            severity = AlertSeverity.EMERGENCY;

        //---------------------------------------------------------
        // Priority
        //---------------------------------------------------------

        let priority: AlertPriority;

        if (density.score < 20)
            priority = AlertPriority.LOW;

        else if (density.score < 40)
            priority = AlertPriority.NORMAL;

        else if (density.score < 60)
            priority = AlertPriority.HIGH;

        else if (density.score < 80)
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
                AlertCategory.DENSITY_ALTITUDE,

            severity,

            priority,

            title:
                "High Density Altitude",

            summary:
                "Aircraft performance may be significantly reduced.",

            message:
                `${density.operationalStatus}. ${density.pilotMessage}`,

            hazard:
                "High density altitude reduces engine power, climb performance and aircraft lift.",

            operationalImpact:
                density.airportMessage,

            recommendedActions:
                density.recommendations,

            riskScore:
                density.score,

            confidence:
                weather.confidence,

            source:
                "Density Altitude Rule Engine",

            weatherParameter:
                "Density Altitude",

            parameterValue:
                weather.densityAltitude ?? 0,

            metadata: {

                densityAltitude:
                    weather.densityAltitude,

                pressureAltitude:
                    weather.pressureAltitude,

                elevation:
                    weather.elevation,

                temperature:
                    weather.temperature,

                qnh:
                    weather.qnh,

                operationalStatus:
                    density.operationalStatus,

                severity:
                    density.severity

            }

        });

    }

}