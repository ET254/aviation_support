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

export interface ATCRecommendation {

    airportStatus:
        | "OPEN"
        | "LIMITED"
        | "RESTRICTED"
        | "CLOSED";

    trafficFlow:
        | "NORMAL"
        | "REDUCED"
        | "HOLDING"
        | "SUSPENDED";

    runwayStatus:
        | "AVAILABLE"
        | "CAUTION"
        | "RESTRICTED"
        | "CLOSED";

    separation:
        | "NORMAL"
        | "INCREASED"
        | "MAXIMUM";

    lowVisibilityProcedures: boolean;

    arrivalRestrictions: boolean;

    departureRestrictions: boolean;

    holdingRequired: boolean;

    groundStopRecommended: boolean;

    runwayInspectionRequired: boolean;

    summary: string;

    hazards: string[];

    recommendations: string[];

}

export class ATCRecommendations {

    /**
     * ============================================================
     * Main Recommendation Engine
     * ============================================================
     */

    static generate(
        wx: CanonicalWeatherObservation
    ): ATCRecommendation {

        const hazards: string[] = [];

        const recommendations: string[] = [];

        //----------------------------------------------------------
        // Evaluate every weather rule
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
                visibility.atcMessage
            );

        }

        //----------------------------------------------------------
        // Wind
        //----------------------------------------------------------

        if (wind.score > 0) {

            hazards.push("Strong Wind");

            recommendations.push(
                wind.atcMessage
            );

        }

        //----------------------------------------------------------
        // Runway
        //----------------------------------------------------------

        if (runway.score > 0) {

            hazards.push("Runway Condition");

            recommendations.push(
                runway.atcMessage
            );

        }

        //----------------------------------------------------------
        // Cloud
        //----------------------------------------------------------

        if (cloud.score > 0) {

            hazards.push("Low Cloud");

            recommendations.push(
                cloud.atcMessage
            );

        }

        //----------------------------------------------------------
        // Icing
        //----------------------------------------------------------

        if (icing.score > 0) {

            hazards.push("Icing");

            recommendations.push(
                icing.atcMessage
            );

        }

                //----------------------------------------------------------
        // Turbulence
        //----------------------------------------------------------

        if (turbulence.score > 0) {

            hazards.push("Turbulence");

            recommendations.push(
                turbulence.atcMessage
            );

        }

        //----------------------------------------------------------
        // Thunderstorm
        //----------------------------------------------------------

        if (thunderstorm.score > 0) {

            hazards.push("Thunderstorm");

            recommendations.push(
                thunderstorm.atcMessage
            );

        }

        //----------------------------------------------------------
        // Precipitation
        //----------------------------------------------------------

        if (precipitation.score > 0) {

            hazards.push("Precipitation");

            recommendations.push(
                precipitation.atcMessage
            );

        }

        //----------------------------------------------------------
        // Density Altitude
        //----------------------------------------------------------

        if (densityAltitude.score > 0) {

            hazards.push("High Density Altitude");

            recommendations.push(
                densityAltitude.atcMessage
            );

        }

        //----------------------------------------------------------
        // Volcanic Ash
        //----------------------------------------------------------

        if (volcanicAsh.score > 0) {

            hazards.push("Volcanic Ash");

            recommendations.push(
                volcanicAsh.atcMessage
            );

        }

        //----------------------------------------------------------
        // Highest Operational Risk
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
        // Airport Status
        //----------------------------------------------------------

        let airportStatus:
            ATCRecommendation["airportStatus"];

        if (volcanicAsh.score >= 70) {

            airportStatus = "CLOSED";

        }

        else if (highestScore >= 70) {

            airportStatus = "RESTRICTED";

        }

        else if (highestScore >= 40) {

            airportStatus = "LIMITED";

        }

        else {

            airportStatus = "OPEN";

        }

        //----------------------------------------------------------
        // Traffic Flow
        //----------------------------------------------------------

        let trafficFlow:
            ATCRecommendation["trafficFlow"];

        if (airportStatus === "CLOSED") {

            trafficFlow = "SUSPENDED";

        }

        else if (

            thunderstorm.score >= 45 ||

            visibility.score >= 45 ||

            runway.score >= 45

        ) {

            trafficFlow = "HOLDING";

        }

        else if (highestScore >= 35) {

            trafficFlow = "REDUCED";

        }

        else {

            trafficFlow = "NORMAL";

        }

        //----------------------------------------------------------
        // Runway Status
        //----------------------------------------------------------

        let runwayStatus:
            ATCRecommendation["runwayStatus"];

        if (

            runway.score >= 70 ||

            volcanicAsh.score >= 70

        ) {

            runwayStatus = "CLOSED";

        }

        else if (runway.score >= 45) {

            runwayStatus = "RESTRICTED";

        }

        else if (runway.score >= 20) {

            runwayStatus = "CAUTION";

        }

        else {

            runwayStatus = "AVAILABLE";

        }

        //----------------------------------------------------------
        // Separation Standards
        //----------------------------------------------------------

        let separation:
            ATCRecommendation["separation"];

        if (

            visibility.score >= 45 ||

            thunderstorm.score >= 45

        ) {

            separation = "MAXIMUM";

        }

        else if (

            visibility.score >= 20 ||

            wind.score >= 20 ||

            turbulence.score >= 20

        ) {

            separation = "INCREASED";

        }

        else {

            separation = "NORMAL";

        }

        //----------------------------------------------------------
        // Operational Procedures
        //----------------------------------------------------------

        const lowVisibilityProcedures =

            visibility.score >= 35;

        const arrivalRestrictions =

            highestScore >= 45;

        const departureRestrictions =

            highestScore >= 45;

        const holdingRequired =

            trafficFlow === "HOLDING";

        const groundStopRecommended =

            airportStatus === "CLOSED" ||

            volcanicAsh.score >= 70 ||

            thunderstorm.score >= 70;

        const runwayInspectionRequired =

            runway.score >= 35 ||

            precipitation.score >= 40;

                //----------------------------------------------------------
        // Remove Duplicate Recommendations
        //----------------------------------------------------------

        const uniqueRecommendations = [
            ...new Set(recommendations)
        ];

        //----------------------------------------------------------
        // Additional ATC Operational Actions
        //----------------------------------------------------------

        if (lowVisibilityProcedures) {

            uniqueRecommendations.push(
                "Activate Low Visibility Procedures (LVP)."
            );

        }

        if (arrivalRestrictions) {

            uniqueRecommendations.push(
                "Restrict arrival rate based on current weather conditions."
            );

        }

        if (departureRestrictions) {

            uniqueRecommendations.push(
                "Apply departure sequencing and spacing restrictions."
            );

        }

        if (holdingRequired) {

            uniqueRecommendations.push(
                "Coordinate airborne holding and expected delay information."
            );

        }

        if (groundStopRecommended) {

            uniqueRecommendations.push(
                "Initiate ground stop for affected departures."
            );

        }

        if (runwayInspectionRequired) {

            uniqueRecommendations.push(
                "Dispatch runway inspection team immediately."
            );

        }

        if (runwayStatus === "CLOSED") {

            uniqueRecommendations.push(
                "Issue NOTAM for runway closure."
            );

        }

        if (airportStatus === "CLOSED") {

            uniqueRecommendations.push(
                "Coordinate airport closure with Airport Operations, Airlines and AIS."
            );

        }

        if (volcanicAsh.score >= 70) {

            uniqueRecommendations.push(
                "Coordinate with VAAC and Meteorological Office for volcanic ash advisories."
            );

        }

        if (thunderstorm.score >= 45) {

            uniqueRecommendations.push(
                "Monitor convective cells and suspend runway operations if lightning safety limits are exceeded."
            );

        }

        if (wind.score >= 40) {

            uniqueRecommendations.push(
                "Review active runway configuration for prevailing wind."
            );

        }

        //----------------------------------------------------------
        // Operational Summary
        //----------------------------------------------------------

        const summary = [

            `Airport Status: ${airportStatus}`,

            `Traffic Flow: ${trafficFlow}`,

            `Runway Status: ${runwayStatus}`,

            `Separation: ${separation}`,

            hazards.length > 0
                ? `Hazards: ${hazards.join(", ")}`
                : "No significant operational hazards."

        ].join(". ");

        //----------------------------------------------------------
        // Return Recommendation
        //----------------------------------------------------------

        return {

            airportStatus,

            trafficFlow,

            runwayStatus,

            separation,

            lowVisibilityProcedures,

            arrivalRestrictions,

            departureRestrictions,

            holdingRequired,

            groundStopRecommended,

            runwayInspectionRequired,

            summary,

            hazards,

            recommendations: uniqueRecommendations

        };

    }

}