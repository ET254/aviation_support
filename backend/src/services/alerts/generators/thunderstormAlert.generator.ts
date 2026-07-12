import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";

import { ThunderstormRules } from "../../decisionSupport/rules/thunderstorm.rules";

import { AlertFormatter } from "../formatters/alertFormatter";

import { AlertCategory } from "../models/AlertModel";
import { AlertPriority } from "../models/AlertPriority";
import { AlertSeverity } from "../models/AlertSeverity";

/**
 * ============================================================================
 * Thunderstorm Alert Generator
 * ============================================================================
 */

export class ThunderstormAlertGenerator {

    /**
     * =========================================================================
     * Generate Thunderstorm Alert
     * =========================================================================
     */

    static generate(
        weather: CanonicalWeatherObservation
    ) {

        const storm =
            ThunderstormRules.evaluate(weather);

        //---------------------------------------------------------
        // No alert
        //---------------------------------------------------------

        if (storm.score <= 0) {

            return null;

        }

        //---------------------------------------------------------
        // Severity
        //---------------------------------------------------------

        let severity: AlertSeverity;

        if (storm.score < 20)
            severity = AlertSeverity.INFORMATION;

        else if (storm.score < 40)
            severity = AlertSeverity.ADVISORY;

        else if (storm.score < 60)
            severity = AlertSeverity.WATCH;

        else if (storm.score < 80)
            severity = AlertSeverity.WARNING;

        else
            severity = AlertSeverity.EMERGENCY;

        //---------------------------------------------------------
        // Priority
        //---------------------------------------------------------

        let priority: AlertPriority;

        if (storm.score < 20)
            priority = AlertPriority.LOW;

        else if (storm.score < 40)
            priority = AlertPriority.NORMAL;

        else if (storm.score < 60)
            priority = AlertPriority.HIGH;

        else if (storm.score < 80)
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
                AlertCategory.THUNDERSTORM,

            severity,

            priority,

            title:
                "Thunderstorm Hazard",

            summary:
                "Convective weather poses a significant operational risk.",

            message:
                `${storm.operationalStatus}. ${storm.pilotMessage}`,

            hazard:
                "Thunderstorms may produce lightning, hail, severe turbulence, wind shear and microbursts.",

            operationalImpact:
                storm.airportMessage,

            recommendedActions:
                storm.recommendations,

            riskScore:
                storm.score,

            confidence:
                weather.confidence,

            source:
                "Thunderstorm Rule Engine",

            weatherParameter:
                "Thunderstorm",

            parameterValue:
                weather.thunderstorm
                    ? "Present"
                    : "None",

            metadata: {

                thunderstorm:
                    weather.thunderstorm,

                lightning:
                    weather.lightning,

                hail:
                    weather.hail,

                cumulonimbus:
                    weather.cumulonimbus,

                toweringCumulus:
                    weather.toweringCumulus,

                squall:
                    weather.squall,

                tornado:
                    weather.tornado,

                funnelCloud:
                    weather.funnelCloud,

                windShear:
                    weather.lowLevelWindShear,

                operationalStatus:
                    storm.operationalStatus,

                severity:
                    storm.severity

            }

        });

    }

}