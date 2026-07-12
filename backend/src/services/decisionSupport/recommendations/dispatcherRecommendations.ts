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

export interface DispatcherRecommendation {

    dispatchStatus:
        | "RELEASE"
        | "RELEASE_WITH_RESTRICTIONS"
        | "DELAY"
        | "DIVERT"
        | "CANCEL";

    operationalRisk:
        | "LOW"
        | "MODERATE"
        | "HIGH"
        | "EXTREME";

    alternateRequired: boolean;

    additionalFuelRequired: boolean;

    payloadRestriction: boolean;

    routeModificationRequired: boolean;

    deicingRequired: boolean;

    cancellationRecommended: boolean;

    delayRecommended: boolean;

    summary: string;

    hazards: string[];

    recommendations: string[];

}

export class DispatcherRecommendations {

    /**
     * ============================================================
     * Main Dispatcher Recommendation Engine
     * ============================================================
     */

    static generate(
        wx: CanonicalWeatherObservation
    ): DispatcherRecommendation {

        const hazards: string[] = [];

        const recommendations: string[] = [];

        //----------------------------------------------------------
        // Evaluate all weather rule engines
        //----------------------------------------------------------

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

        //----------------------------------------------------------
        // Visibility
        //----------------------------------------------------------

        if (visibility.score > 0) {

            hazards.push("Reduced Visibility");

            recommendations.push(
                visibility.dispatcherMessage
            );

        }

        //----------------------------------------------------------
        // Wind
        //----------------------------------------------------------

        if (wind.score > 0) {

            hazards.push("Strong Wind");

            recommendations.push(
                wind.dispatcherMessage
            );

        }

        //----------------------------------------------------------
        // Runway
        //----------------------------------------------------------

        if (runway.score > 0) {

            hazards.push("Runway Condition");

            recommendations.push(
                runway.dispatcherMessage
            );

        }

        //----------------------------------------------------------
        // Cloud
        //----------------------------------------------------------

        if (cloud.score > 0) {

            hazards.push("Low Cloud");

            recommendations.push(
                cloud.dispatcherMessage
            );

        }

        //----------------------------------------------------------
        // Icing
        //----------------------------------------------------------

        if (icing.score > 0) {

            hazards.push("Icing");

            recommendations.push(
                icing.dispatcherMessage
            );

        }

                //----------------------------------------------------------
        // Turbulence
        //----------------------------------------------------------

        if (turbulence.score > 0) {

            hazards.push("Turbulence");

            recommendations.push(
                turbulence.dispatcherMessage
            );

        }

        //----------------------------------------------------------
        // Thunderstorm
        //----------------------------------------------------------

        if (thunderstorm.score > 0) {

            hazards.push("Thunderstorm");

            recommendations.push(
                thunderstorm.dispatcherMessage
            );

        }

        //----------------------------------------------------------
        // Precipitation
        //----------------------------------------------------------

        if (precipitation.score > 0) {

            hazards.push("Precipitation");

            recommendations.push(
                precipitation.dispatcherMessage
            );

        }

        //----------------------------------------------------------
        // Density Altitude
        //----------------------------------------------------------

        if (densityAltitude.score > 0) {

            hazards.push("High Density Altitude");

            recommendations.push(
                densityAltitude.dispatcherMessage
            );

        }

        //----------------------------------------------------------
        // Volcanic Ash
        //----------------------------------------------------------

        if (volcanicAsh.score > 0) {

            hazards.push("Volcanic Ash");

            recommendations.push(
                volcanicAsh.dispatcherMessage
            );

        }

        //----------------------------------------------------------
        // Highest Risk
        //----------------------------------------------------------

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

        //----------------------------------------------------------
        // Operational Risk
        //----------------------------------------------------------

        let operationalRisk:
            DispatcherRecommendation["operationalRisk"];

        if (highestScore < 20) {

            operationalRisk = "LOW";

        }

        else if (highestScore < 45) {

            operationalRisk = "MODERATE";

        }

        else if (highestScore < 70) {

            operationalRisk = "HIGH";

        }

        else {

            operationalRisk = "EXTREME";

        }

        //----------------------------------------------------------
        // Dispatch Status
        //----------------------------------------------------------

        let dispatchStatus:
            DispatcherRecommendation["dispatchStatus"];

        if (volcanicAsh.score >= 70) {

            dispatchStatus = "CANCEL";

        }

        else if (highestScore >= 70) {

            dispatchStatus = "DIVERT";

        }

        else if (highestScore >= 45) {

            dispatchStatus = "DELAY";

        }

        else if (highestScore >= 20) {

            dispatchStatus = "RELEASE_WITH_RESTRICTIONS";

        }

        else {

            dispatchStatus = "RELEASE";

        }

        //----------------------------------------------------------
        // Flight Dispatch Decisions
        //----------------------------------------------------------

        const alternateRequired =

            visibility.score >= 35 ||

            thunderstorm.score >= 35 ||

            runway.score >= 35;

        const additionalFuelRequired =

            alternateRequired ||

            thunderstorm.score >= 30 ||

            turbulence.score >= 30 ||

            wind.score >= 30;

        const payloadRestriction =

            densityAltitude.score >= 35 ||

            runway.score >= 45 ||

            wind.score >= 45;

        const routeModificationRequired =

            thunderstorm.score >= 35 ||

            turbulence.score >= 35 ||

            volcanicAsh.score > 0;

        const deicingRequired =

            icing.score >= 20;

        const cancellationRecommended =

            dispatchStatus === "CANCEL";

        const delayRecommended =

            dispatchStatus === "DELAY";
            
                //----------------------------------------------------------
        // Remove Duplicate Recommendations
        //----------------------------------------------------------

        const uniqueRecommendations = [
            ...new Set(recommendations)
        ];

        //----------------------------------------------------------
        // Dispatcher Operational Actions
        //----------------------------------------------------------

        if (alternateRequired) {

            uniqueRecommendations.push(
                "Select and validate a suitable alternate airport."
            );

        }

        if (additionalFuelRequired) {

            uniqueRecommendations.push(
                "Upload additional contingency, holding and alternate fuel."
            );

        }

        if (payloadRestriction) {

            uniqueRecommendations.push(
                "Review payload and consider weight restrictions."
            );

        }

        if (routeModificationRequired) {

            uniqueRecommendations.push(
                "Plan an alternate routing to avoid hazardous weather."
            );

        }

        if (deicingRequired) {

            uniqueRecommendations.push(
                "Coordinate aircraft de-icing before departure."
            );

        }

        if (delayRecommended) {

            uniqueRecommendations.push(
                "Delay flight release until operational conditions improve."
            );

        }

        if (cancellationRecommended) {

            uniqueRecommendations.push(
                "Cancel the flight and notify all operational stakeholders."
            );

        }

        if (volcanicAsh.score > 0) {

            uniqueRecommendations.push(
                "Coordinate with VAAC and avoid all volcanic ash contaminated airspace."
            );

        }

        if (thunderstorm.score >= 35) {

            uniqueRecommendations.push(
                "Review convective SIGMETs and expected thunderstorm movement."
            );

        }

        if (turbulence.score >= 35) {

            uniqueRecommendations.push(
                "Plan flight level changes to minimize turbulence exposure."
            );

        }

        if (wind.score >= 35) {

            uniqueRecommendations.push(
                "Review crosswind limitations for departure and destination airports."
            );

        }

        if (visibility.score >= 35) {

            uniqueRecommendations.push(
                "Verify destination weather meets approach minima."
            );

        }

        //----------------------------------------------------------
        // Operational Summary
        //----------------------------------------------------------

        const summary = [

            `Dispatch Status: ${dispatchStatus}`,

            `Operational Risk: ${operationalRisk}`,

            alternateRequired
                ? "Alternate Airport Required"
                : "Alternate Airport Not Required",

            additionalFuelRequired
                ? "Additional Fuel Required"
                : "Standard Fuel Planning",

            hazards.length > 0
                ? `Hazards: ${hazards.join(", ")}`
                : "No significant operational hazards."

        ].join(". ");

        //----------------------------------------------------------
        // Return Dispatcher Recommendation
        //----------------------------------------------------------

        return {

            dispatchStatus,

            operationalRisk,

            alternateRequired,

            additionalFuelRequired,

            payloadRestriction,

            routeModificationRequired,

            deicingRequired,

            cancellationRecommended,

            delayRecommended,

            summary,

            hazards,

            recommendations: uniqueRecommendations

        };

    }

}