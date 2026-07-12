import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";

import { WindRules } from "../../decisionSupport/rules/wind.rules";

import { AlertFormatter } from "../formatters/alertFormatter";

import { AlertCategory } from "../models/AlertModel";
import { AlertPriority } from "../models/AlertPriority";
import { AlertSeverity } from "../models/AlertSeverity";

/**
 * ============================================================================
 * Wind Alert Generator
 * ============================================================================
 */

export class WindAlertGenerator {

    /**
     * =========================================================================
     * Generate Wind Alert
     * =========================================================================
     */

    static generate(
        weather: CanonicalWeatherObservation
    ) {

        const wind =
            WindRules.evaluate(weather);

        //---------------------------------------------------------
        // No alert
        //---------------------------------------------------------

        if (wind.score <= 0) {

            return null;

        }

        //---------------------------------------------------------
        // Severity
        //---------------------------------------------------------

        let severity: AlertSeverity;

        if (wind.score < 20)
            severity = AlertSeverity.INFORMATION;

        else if (wind.score < 40)
            severity = AlertSeverity.ADVISORY;

        else if (wind.score < 60)
            severity = AlertSeverity.WATCH;

        else if (wind.score < 80)
            severity = AlertSeverity.WARNING;

        else
            severity = AlertSeverity.EMERGENCY;

        //---------------------------------------------------------
        // Priority
        //---------------------------------------------------------

        let priority: AlertPriority;

        if (wind.score < 20)
            priority = AlertPriority.LOW;

        else if (wind.score < 40)
            priority = AlertPriority.NORMAL;

        else if (wind.score < 60)
            priority = AlertPriority.HIGH;

        else if (wind.score < 80)
            priority = AlertPriority.URGENT;

        else
            priority = AlertPriority.IMMEDIATE;

        //---------------------------------------------------------
        // Alert
        //---------------------------------------------------------

        return AlertFormatter.create({

            stationId: weather.stationId,

            stationCode: weather.stationCode,

            stationName: weather.stationName,

            category: AlertCategory.WIND,

            severity,

            priority,

            title: "Adverse Wind Conditions",

            summary:
                "Operational wind limits exceeded.",

            message:
                `${wind.operationalStatus}. ${wind.pilotMessage}`,

            hazard:
                "Strong winds, gusts or crosswind conditions may affect flight operations.",

            operationalImpact:
                wind.runwayRecommendation,

            recommendedActions:
                wind.recommendations,

            riskScore:
                wind.score,

            confidence:
                weather.confidence,

            source:
                "Wind Rule Engine",

            weatherParameter:
                "Wind",

            parameterValue:
                weather.windSpeed,

            metadata: {

    windDirection: wind.windDirection,

    windSpeed: wind.windSpeed,

    gust: wind.gust,

    crosswind: wind.crosswind,

    headwind: wind.headwind,

    tailwind: wind.tailwind,

    runwayRecommendation:
        wind.runwayRecommendation,

    operationalStatus:
        wind.operationalStatus,

    severity:
        wind.severity

}

        });

    }

}