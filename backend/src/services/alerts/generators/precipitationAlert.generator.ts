import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";

import { PrecipitationRules } from "../../decisionSupport/rules/precipitation.rules";

import { AlertFormatter } from "../formatters/alertFormatter";

import { AlertCategory } from "../models/AlertModel";
import { AlertPriority } from "../models/AlertPriority";
import { AlertSeverity } from "../models/AlertSeverity";

/**
 * ============================================================================
 * Precipitation Alert Generator
 * ============================================================================
 */

export class PrecipitationAlertGenerator {

    /**
     * =========================================================================
     * Generate Precipitation Alert
     * =========================================================================
     */

    static generate(
        weather: CanonicalWeatherObservation
    ) {

        const precipitation =
            PrecipitationRules.evaluate(weather);

        //---------------------------------------------------------
        // No alert
        //---------------------------------------------------------

        if (precipitation.score <= 0) {

            return null;

        }

        //---------------------------------------------------------
        // Severity
        //---------------------------------------------------------

        let severity: AlertSeverity;

        if (precipitation.score < 20)
            severity = AlertSeverity.INFORMATION;

        else if (precipitation.score < 40)
            severity = AlertSeverity.ADVISORY;

        else if (precipitation.score < 60)
            severity = AlertSeverity.WATCH;

        else if (precipitation.score < 80)
            severity = AlertSeverity.WARNING;

        else
            severity = AlertSeverity.EMERGENCY;

        //---------------------------------------------------------
        // Priority
        //---------------------------------------------------------

        let priority: AlertPriority;

        if (precipitation.score < 20)
            priority = AlertPriority.LOW;

        else if (precipitation.score < 40)
            priority = AlertPriority.NORMAL;

        else if (precipitation.score < 60)
            priority = AlertPriority.HIGH;

        else if (precipitation.score < 80)
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
                AlertCategory.PRECIPITATION,

            severity,

            priority,

            title:
                "Precipitation Hazard",

            summary:
                "Precipitation may affect aviation operations.",

            message:
                `${precipitation.operationalStatus}. ${precipitation.pilotMessage}`,

            hazard:
                "Rain, snow, hail or freezing precipitation may reduce visibility and runway performance.",

            operationalImpact:
                precipitation.airportMessage,

            recommendedActions:
                precipitation.recommendations,

            riskScore:
                precipitation.score,

            confidence:
                weather.confidence,

            source:
                "Precipitation Rule Engine",

            weatherParameter:
                "Precipitation",

            parameterValue:
                weather.precipitationType ?? "None",

            metadata: {

                type:
                    weather.precipitationType,

                intensity:
                    weather.precipitationIntensity,

                rate:
                    weather.precipitationRate,

                accumulation:
                    weather.accumulation,

                visibility:
                    weather.visibility,

                runwayCondition:
                    weather.runwayCondition,

                operationalStatus:
                    precipitation.operationalStatus,

                severity:
                    precipitation.severity

            }

        });

    }

}