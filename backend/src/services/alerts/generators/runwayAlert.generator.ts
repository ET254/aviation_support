import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";

import { RunwayRules } from "../../decisionSupport/rules/runway.rules";

import { AlertFormatter } from "../formatters/alertFormatter";

import { AlertCategory } from "../models/AlertModel";
import { AlertPriority } from "../models/AlertPriority";
import { AlertSeverity } from "../models/AlertSeverity";

/**
 * ============================================================================
 * Runway Alert Generator
 * ============================================================================
 */

export class RunwayAlertGenerator {

    /**
     * =========================================================================
     * Generate Runway Alert
     * =========================================================================
     */

    static generate(
        weather: CanonicalWeatherObservation
    ) {

        const runway =
            RunwayRules.evaluate(weather);

        //---------------------------------------------------------
        // No operational concern
        //---------------------------------------------------------

        if (runway.score <= 0) {

            return null;

        }

        //---------------------------------------------------------
        // Severity
        //---------------------------------------------------------

        let severity: AlertSeverity;

        if (runway.score < 20)
            severity = AlertSeverity.INFORMATION;

        else if (runway.score < 40)
            severity = AlertSeverity.ADVISORY;

        else if (runway.score < 60)
            severity = AlertSeverity.WATCH;

        else if (runway.score < 80)
            severity = AlertSeverity.WARNING;

        else
            severity = AlertSeverity.EMERGENCY;

        //---------------------------------------------------------
        // Priority
        //---------------------------------------------------------

        let priority: AlertPriority;

        if (runway.score < 20)
            priority = AlertPriority.LOW;

        else if (runway.score < 40)
            priority = AlertPriority.NORMAL;

        else if (runway.score < 60)
            priority = AlertPriority.HIGH;

        else if (runway.score < 80)
            priority = AlertPriority.URGENT;

        else
            priority = AlertPriority.IMMEDIATE;

        //---------------------------------------------------------
        // Build alert
        //---------------------------------------------------------

        return AlertFormatter.create({

            stationId:
                weather.stationId,

            stationCode:
                weather.stationCode,

            stationName:
                weather.stationName,

            category:
                AlertCategory.RUNWAY,

            severity,

            priority,

            title:
                "Runway Operational Hazard",

            summary:
                "Runway condition requires operational attention.",

            message:
                `${runway.operationalStatus}. ${runway.pilotMessage}`,

            hazard:
                "Runway contamination or braking performance may affect aircraft operations.",

            operationalImpact:
                runway.airportMessage,

            recommendedActions:
                runway.recommendations,

            riskScore:
                runway.score,

            confidence:
                weather.confidence,

            source:
                "Runway Rule Engine",

            weatherParameter:
                "Runway Condition",

            parameterValue:
                weather.runwayCondition,

            metadata: {

                runwayCondition:
                    weather.runwayCondition,

                brakingAction:
                    weather.brakingAction,

                contamination:
                    weather.runwayContaminationPercent,

                friction:
                    weather.runwayFrictionCoefficient,

                standingWater:
                    weather.standingWater,

                snowDepth:
                    weather.snowDepth,

                slushDepth:
                    weather.slushDepth,

                operationalStatus:
                    runway.operationalStatus,

                severity:
                    runway.severity

            }

        });

    }

}