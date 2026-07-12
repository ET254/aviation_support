import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";

import { CloudRules } from "../../decisionSupport/rules/cloud.rules";

import { AlertFormatter } from "../formatters/alertFormatter";

import { AlertCategory } from "../models/AlertModel";
import { AlertPriority } from "../models/AlertPriority";
import { AlertSeverity } from "../models/AlertSeverity";

/**
 * ============================================================================
 * Cloud Alert Generator
 * ============================================================================
 */

export class CloudAlertGenerator {

    /**
     * =========================================================================
     * Generate Cloud Alert
     * =========================================================================
     */

    static generate(
        weather: CanonicalWeatherObservation
    ) {

        const cloud =
            CloudRules.evaluate(weather);

        //---------------------------------------------------------
        // No operational concern
        //---------------------------------------------------------

        if (cloud.score <= 0) {

            return null;

        }

        //---------------------------------------------------------
        // Severity
        //---------------------------------------------------------

        let severity: AlertSeverity;

        if (cloud.score < 20)
            severity = AlertSeverity.INFORMATION;

        else if (cloud.score < 40)
            severity = AlertSeverity.ADVISORY;

        else if (cloud.score < 60)
            severity = AlertSeverity.WATCH;

        else if (cloud.score < 80)
            severity = AlertSeverity.WARNING;

        else
            severity = AlertSeverity.EMERGENCY;

        //---------------------------------------------------------
        // Priority
        //---------------------------------------------------------

        let priority: AlertPriority;

        if (cloud.score < 20)
            priority = AlertPriority.LOW;

        else if (cloud.score < 40)
            priority = AlertPriority.NORMAL;

        else if (cloud.score < 60)
            priority = AlertPriority.HIGH;

        else if (cloud.score < 80)
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
                AlertCategory.CLOUD,

            severity,

            priority,

            title:
                "Cloud and Ceiling Hazard",

            summary:
                "Cloud conditions may affect aviation operations.",

            message:
                `${cloud.operationalStatus}. ${cloud.pilotMessage}`,

            hazard:
                "Low cloud base, ceiling or convective cloud may reduce operational capability.",

            operationalImpact:
                cloud.airportMessage,

            recommendedActions:
                cloud.recommendations,

            riskScore:
                cloud.score,

            confidence:
                weather.confidence,

            source:
                "Cloud Rule Engine",

            weatherParameter:
                "Cloud",

            parameterValue:
                weather.ceiling,

            metadata: {

                cloudBase:
                    weather.cloudBase,

                cloudTop:
                    weather.cloudTop,

                ceiling:
                    weather.ceiling,

                cloudAmount:
                    weather.cloudAmount,

                cloudType:
                    weather.cloudType,

                convectiveClouds:
                    weather.convectiveClouds,

                cumulonimbus:
                    weather.cumulonimbus,

                toweringCumulus:
                    weather.toweringCumulus,

                operationalStatus:
                    cloud.operationalStatus,

                severity:
                    cloud.severity

            }

        });

    }

}