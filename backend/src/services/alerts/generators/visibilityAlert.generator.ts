import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";

import { VisibilityRules } from "../../decisionSupport/rules/visibility.rules";
import { AlertFormatter } from "../formatters/alertFormatter";

import { AlertCategory } from "../models/AlertModel";
import { AlertPriority } from "../models/AlertPriority";
import { AlertSeverity } from "../models/AlertSeverity";

/**
 * ============================================================================
 * Visibility Alert Generator
 * ============================================================================
 */

export class VisibilityAlertGenerator {

    /**
     * ================================================================
     * Generate Visibility Alert
     * ================================================================
     */

    static generate(

        weather: CanonicalWeatherObservation

    ) {

        const visibility = VisibilityRules.evaluate(weather);

        //---------------------------------------------------------
        // No operational issue
        //---------------------------------------------------------

        if (visibility.score <= 0) {

            return null;

        }

        //---------------------------------------------------------
        // Determine Severity
        //---------------------------------------------------------

        let severity: AlertSeverity;

        if (visibility.score < 20) {

            severity = AlertSeverity.INFORMATION;

        }

        else if (visibility.score < 40) {

            severity = AlertSeverity.ADVISORY;

        }

        else if (visibility.score < 60) {

            severity = AlertSeverity.WATCH;

        }

        else if (visibility.score < 80) {

            severity = AlertSeverity.WARNING;

        }

        else {

            severity = AlertSeverity.EMERGENCY;

        }

        //---------------------------------------------------------
        // Determine Priority
        //---------------------------------------------------------

        let priority: AlertPriority;

        if (visibility.score < 20) {

            priority = AlertPriority.LOW;

        }

        else if (visibility.score < 40) {

            priority = AlertPriority.NORMAL;

        }

        else if (visibility.score < 60) {

            priority = AlertPriority.HIGH;

        }

        else if (visibility.score < 80) {

            priority = AlertPriority.URGENT;

        }

        else {

            priority = AlertPriority.IMMEDIATE;

        }

        //---------------------------------------------------------
        // Build Alert
        //---------------------------------------------------------

        return AlertFormatter.create({

            stationId: weather.stationId,

            stationCode: weather.stationCode,

            stationName: weather.stationName,

            category: AlertCategory.VISIBILITY,

            severity,

            priority,

            title: "Reduced Visibility",

            summary:
                "Visibility below operational threshold.",

            message:
                `${visibility.operationalStatus}. ${visibility.pilotMessage}`,

            hazard:
                "Reduced visibility affecting aviation operations.",

            operationalImpact:
                "Take-off, landing and taxi operations may be affected.",

            recommendedActions: visibility.recommendations,

            riskScore: visibility.score,

            confidence: weather.confidence,

            source: "Visibility Rule Engine",

            weatherParameter: "Visibility",

            parameterValue:
                weather.visibility,

            threshold:
                undefined,

            metadata: {

                category: weather.flightCategory,

                rvr: weather.rvr,

                fog: weather.fog,

                mist: weather.mist,

                haze: weather.haze

            }

        });

    }

}