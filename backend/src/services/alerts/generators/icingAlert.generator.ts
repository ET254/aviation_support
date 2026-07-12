import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";

import { IcingRules } from "../../decisionSupport/rules/icing.rules";

import { AlertFormatter } from "../formatters/alertFormatter";

import { AlertCategory } from "../models/AlertModel";
import { AlertPriority } from "../models/AlertPriority";
import { AlertSeverity } from "../models/AlertSeverity";

/**
 * ============================================================================
 * Icing Alert Generator
 * ============================================================================
 */

export class IcingAlertGenerator {

    /**
     * =========================================================================
     * Generate Icing Alert
     * =========================================================================
     */

    static generate(
        weather: CanonicalWeatherObservation
    ) {

        const icing =
            IcingRules.evaluate(weather);

        //---------------------------------------------------------
        // No alert required
        //---------------------------------------------------------

        if (icing.score <= 0) {

            return null;

        }

        //---------------------------------------------------------
        // Severity
        //---------------------------------------------------------

        let severity: AlertSeverity;

        if (icing.score < 20)
            severity = AlertSeverity.INFORMATION;

        else if (icing.score < 40)
            severity = AlertSeverity.ADVISORY;

        else if (icing.score < 60)
            severity = AlertSeverity.WATCH;

        else if (icing.score < 80)
            severity = AlertSeverity.WARNING;

        else
            severity = AlertSeverity.EMERGENCY;

        //---------------------------------------------------------
        // Priority
        //---------------------------------------------------------

        let priority: AlertPriority;

        if (icing.score < 20)
            priority = AlertPriority.LOW;

        else if (icing.score < 40)
            priority = AlertPriority.NORMAL;

        else if (icing.score < 60)
            priority = AlertPriority.HIGH;

        else if (icing.score < 80)
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
                AlertCategory.ICING,

            severity,

            priority,

            title:
                "Aircraft Icing Hazard",

            summary:
                "Atmospheric icing conditions detected.",

            message:
                `${icing.operationalStatus}. ${icing.pilotMessage}`,

            hazard:
                "Airframe, engine and propeller icing may significantly degrade aircraft performance.",

            operationalImpact:
                icing.airportMessage,

            recommendedActions:
                icing.recommendations,

            riskScore:
                icing.score,

            confidence:
                weather.confidence,

            source:
                "Icing Rule Engine",

            weatherParameter:
                "Icing",

            parameterValue:
                weather.icingSeverity,

            metadata: {

                icing:
                    weather.icing,

                icingSeverity:
                    weather.icingSeverity,

                icingBase:
                    weather.icingBase,

                icingTop:
                    weather.icingTop,

                freezingRain:
                    weather.freezingRain,

                freezingDrizzle:
                    weather.freezingDrizzle,

                supercooledLiquidWater:
                    weather.supercooledLiquidWater,

                freezingLevel:
                    weather.freezingLevel,

                operationalStatus:
                    icing.operationalStatus,

                severity:
                    icing.severity

            }

        });

    }

}