import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";

import { VisibilityRules } from "../rules/visibility.rules";
import { WindRules } from "../rules/wind.rules";
import { RunwayRules } from "../rules/runway.rules";
import { CloudRules } from "../rules/cloud.rules";
import { IcingRules } from "../rules/icing.rules";
import { TurbulenceRules } from "../rules/turbulence.rules";
import { ThunderstormRules } from "../rules/thunderstorm.rules";
import { PrecipitationRules } from "../rules/precipitation.rules";
import { DensityAltitudeRules } from "../rules/densityAltitude.rules";
import { VolcanicAshRules } from "../rules/volcanicAsh.rules";

export interface PilotRecommendation {

    overallStatus:
        | "GO"
        | "GO_WITH_CAUTION"
        | "DELAY"
        | "DIVERT"
        | "NO_GO";

    overallRisk:
        | "LOW"
        | "MODERATE"
        | "HIGH"
        | "EXTREME";

    summary: string;

    recommendations: string[];

    hazards: string[];

    requiredActions: string[];

}

export class PilotRecommendations {

    /**
     * ============================================================
     * Main Recommendation Engine
     * ============================================================
     */

    static generate(
        wx: CanonicalWeatherObservation
    ): PilotRecommendation {

        const recommendations: string[] = [];

        const hazards: string[] = [];

        const requiredActions: string[] = [];

        //---------------------------------------------------------
        // Evaluate all rule engines
        //---------------------------------------------------------

        const visibility =
            VisibilityRules.evaluate(wx);

        const wind =
            WindRules.evaluate(wx);

        const runway =
            RunwayRules.evaluate(wx);

        const cloud =
            CloudRules.evaluate(wx);

        const icing =
            IcingRules.evaluate(wx);

        const turbulence =
            TurbulenceRules.evaluate(wx);

        const thunderstorm =
            ThunderstormRules.evaluate(wx);

        const precipitation =
            PrecipitationRules.evaluate(wx);

        const densityAltitude =
            DensityAltitudeRules.evaluate(wx);

        const volcanicAsh =
            VolcanicAshRules.evaluate(wx);
                //---------------------------------------------------------
        // Visibility
        //---------------------------------------------------------

        if (visibility.score > 0) {

            hazards.push("Reduced Visibility");

            recommendations.push(
                visibility.pilotMessage
            );

        }

        //---------------------------------------------------------
        // Wind
        //---------------------------------------------------------

        if (wind.score > 0) {

            hazards.push("Strong Wind");

            recommendations.push(
                wind.pilotMessage
            );

        }

        //---------------------------------------------------------
        // Runway
        //---------------------------------------------------------

        if (runway.score > 0) {

            hazards.push("Runway Condition");

            recommendations.push(
                runway.pilotMessage
            );

        }

        //---------------------------------------------------------
        // Cloud
        //---------------------------------------------------------

        if (cloud.score > 0) {

            hazards.push("Cloud");

            recommendations.push(
                cloud.pilotMessage
            );

        }

        //---------------------------------------------------------
        // Icing
        //---------------------------------------------------------

        if (icing.score > 0) {

            hazards.push("Icing");

            recommendations.push(
                icing.pilotMessage
            );

        }

                //---------------------------------------------------------
        // Turbulence
        //---------------------------------------------------------

        if (turbulence.score > 0) {

            hazards.push("Turbulence");

            recommendations.push(
                turbulence.pilotMessage
            );

        }

        //---------------------------------------------------------
        // Thunderstorm
        //---------------------------------------------------------

        if (thunderstorm.score > 0) {

            hazards.push("Thunderstorm");

            recommendations.push(
                thunderstorm.pilotMessage
            );

        }

        //---------------------------------------------------------
        // Precipitation
        //---------------------------------------------------------

        if (precipitation.score > 0) {

            hazards.push("Precipitation");

            recommendations.push(
                precipitation.pilotMessage
            );

        }

        //---------------------------------------------------------
        // Density Altitude
        //---------------------------------------------------------

        if (densityAltitude.score > 0) {

            hazards.push("High Density Altitude");

            recommendations.push(
                densityAltitude.pilotMessage
            );

        }

        //---------------------------------------------------------
        // Volcanic Ash
        //---------------------------------------------------------

        if (volcanicAsh.score > 0) {

            hazards.push("Volcanic Ash");

            recommendations.push(
                volcanicAsh.pilotMessage
            );

        }

        //---------------------------------------------------------
        // Required Pilot Actions
        //---------------------------------------------------------

        if (visibility.score >= 45) {

            requiredActions.push(
                "Operate under IFR procedures."
            );

        }

        if (wind.score >= 40) {

            requiredActions.push(
                "Review crosswind and gust limitations."
            );

        }

        if (runway.score >= 40) {

            requiredActions.push(
                "Use contaminated runway performance calculations."
            );

        }

        if (icing.score >= 40) {

            requiredActions.push(
                "Aircraft de-icing/anti-icing required."
            );

        }

        if (turbulence.score >= 40) {

            requiredActions.push(
                "Fasten seatbelt sign throughout flight."
            );

        }

        if (thunderstorm.score >= 40) {

            requiredActions.push(
                "Avoid convective weather by at least 20 NM."
            );

        }

        if (precipitation.score >= 40) {

            requiredActions.push(
                "Review braking action and hydroplaning risk."
            );

        }

        if (densityAltitude.score >= 40) {

            requiredActions.push(
                "Reduce aircraft weight and verify takeoff performance."
            );

        }

        if (volcanicAsh.score > 0) {

            requiredActions.push(
                "Avoid volcanic ash. Divert immediately if encountered."
            );

        }

        //---------------------------------------------------------
        // Determine Highest Risk Score
        //---------------------------------------------------------

        const highestScore = Math.max(

            visibility.score,
            wind.score,
            runway.score,
            cloud.score,
            icing.score,
            turbulence.score,
            thunderstorm.score,
            precipitation.score,
            densityAltitude.score,
            volcanicAsh.score

        );

        //---------------------------------------------------------
        // Overall Risk
        //---------------------------------------------------------

        let overallRisk:
            PilotRecommendation["overallRisk"];

        if (highestScore < 20)
            overallRisk = "LOW";

        else if (highestScore < 45)
            overallRisk = "MODERATE";

        else if (highestScore < 70)
            overallRisk = "HIGH";

        else
            overallRisk = "EXTREME";

        //---------------------------------------------------------
        // Overall Operational Status
        //---------------------------------------------------------

        let overallStatus:
            PilotRecommendation["overallStatus"];

        if (highestScore < 20) {

            overallStatus = "GO";

        }

        else if (highestScore < 45) {

            overallStatus = "GO_WITH_CAUTION";

        }

        else if (highestScore < 70) {

            overallStatus = "DELAY";

        }

        else if (volcanicAsh.score >= 70) {

            overallStatus = "NO_GO";

        }

        else {

            overallStatus = "DIVERT";

        }

                //---------------------------------------------------------
        // Build Operational Summary
        //---------------------------------------------------------

        const summaryParts: string[] = [];

        summaryParts.push(
            `Overall Status: ${overallStatus}`
        );

        summaryParts.push(
            `Overall Risk: ${overallRisk}`
        );

        if (hazards.length > 0) {

            summaryParts.push(
                `Hazards: ${hazards.join(", ")}`
            );

        } else {

            summaryParts.push(
                "No significant operational hazards detected."
            );

        }

        //---------------------------------------------------------
        // Remove Duplicate Messages
        //---------------------------------------------------------

        const uniqueRecommendations =
            [...new Set(recommendations)];

        const uniqueActions =
            [...new Set(requiredActions)];

        //---------------------------------------------------------
        // Add General Operational Advice
        //---------------------------------------------------------

        if (
            overallStatus === "GO" &&
            uniqueActions.length === 0
        ) {

            uniqueActions.push(
                "Continue normal flight operations."
            );

        }

        if (
            overallStatus === "GO_WITH_CAUTION"
        ) {

            uniqueActions.push(
                "Review latest METAR, TAF and NOTAM before departure."
            );

        }

        if (
            overallStatus === "DELAY"
        ) {

            uniqueActions.push(
                "Delay departure until weather improves."
            );

        }

        if (
            overallStatus === "DIVERT"
        ) {

            uniqueActions.push(
                "Prepare alternate airport and diversion procedures."
            );

        }

        if (
            overallStatus === "NO_GO"
        ) {

            uniqueActions.push(
                "Do not commence flight under current conditions."
            );

        }

        //---------------------------------------------------------
        // Return Recommendation Package
        //---------------------------------------------------------

        return {

            overallStatus,

            overallRisk,

            summary:
                summaryParts.join(". "),

            recommendations:
                uniqueRecommendations,

            hazards,

            requiredActions:
                uniqueActions

        };

    }

}