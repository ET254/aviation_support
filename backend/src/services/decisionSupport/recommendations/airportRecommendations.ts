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

export interface AirportRecommendation {

    airportStatus:
        | "NORMAL"
        | "LIMITED"
        | "RESTRICTED"
        | "CLOSED";

    runwayOperations: boolean;

    apronOperations: boolean;

    terminalOperations: boolean;

    maintenanceRequired: boolean;

    emergencyStandby: boolean;

    wildlifeInspectionRequired: boolean;

    deicingOperationsRequired: boolean;

    notamRequired: boolean;

    summary: string;

    hazards: string[];

    recommendations: string[];

}

export class AirportRecommendations {

    /**
     * ============================================================
     * Airport Operations Recommendation Engine
     * ============================================================
     */

    static generate(
        wx: CanonicalWeatherObservation
    ): AirportRecommendation {

        const hazards: string[] = [];

        const recommendations: string[] = [];

        //----------------------------------------------------------
        // Evaluate all weather rules
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
                visibility.airportMessage
            );

        }

        //----------------------------------------------------------
        // Wind
        //----------------------------------------------------------

        if (wind.score > 0) {

            hazards.push("Strong Wind");

            recommendations.push(
                wind.airportMessage
            );

        }

        //----------------------------------------------------------
        // Runway
        //----------------------------------------------------------

        if (runway.score > 0) {

            hazards.push("Runway Condition");

            recommendations.push(
                runway.airportMessage
            );

        }

        //----------------------------------------------------------
        // Cloud
        //----------------------------------------------------------

        if (cloud.score > 0) {

            hazards.push("Low Cloud");

            recommendations.push(
                cloud.airportMessage
            );

        }

        //----------------------------------------------------------
        // Icing
        //----------------------------------------------------------

        if (icing.score > 0) {

            hazards.push("Icing");

            recommendations.push(
                icing.airportMessage
            );

        }

                //----------------------------------------------------------
        // Turbulence
        //----------------------------------------------------------

        if (turbulence.score > 0) {

            hazards.push("Turbulence");

            recommendations.push(
                turbulence.airportMessage
            );

        }

        //----------------------------------------------------------
        // Thunderstorm
        //----------------------------------------------------------

        if (thunderstorm.score > 0) {

            hazards.push("Thunderstorm");

            recommendations.push(
                thunderstorm.airportMessage
            );

        }

        //----------------------------------------------------------
        // Precipitation
        //----------------------------------------------------------

        if (precipitation.score > 0) {

            hazards.push("Precipitation");

            recommendations.push(
                precipitation.airportMessage
            );

        }

        //----------------------------------------------------------
        // Density Altitude
        //----------------------------------------------------------

        if (densityAltitude.score > 0) {

            hazards.push("High Density Altitude");

            recommendations.push(
                densityAltitude.airportMessage
            );

        }

        //----------------------------------------------------------
        // Volcanic Ash
        //----------------------------------------------------------

        if (volcanicAsh.score > 0) {

            hazards.push("Volcanic Ash");

            recommendations.push(
                volcanicAsh.airportMessage
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
        // Airport Operational Status
        //----------------------------------------------------------

        let airportStatus:
            AirportRecommendation["airportStatus"];

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

            airportStatus = "NORMAL";

        }

        //----------------------------------------------------------
        // Airport Operations
        //----------------------------------------------------------

        const runwayOperations =

            runway.score < 70 &&
            volcanicAsh.score < 70;

        const apronOperations =

            thunderstorm.score < 45 &&
            wind.score < 45;

        const terminalOperations =

            airportStatus !== "CLOSED";

        const maintenanceRequired =

            runway.score >= 35 ||

            precipitation.score >= 35 ||

            wind.score >= 40;

        const emergencyStandby =

            thunderstorm.score >= 45 ||

            volcanicAsh.score >= 45 ||

            icing.score >= 45;

        const wildlifeInspectionRequired =

            precipitation.score >= 35 ||

            visibility.score >= 35;

        const deicingOperationsRequired =

            icing.score >= 20;

        const notamRequired =

            airportStatus !== "NORMAL" ||

            runway.score >= 35 ||

            volcanicAsh.score > 0;

                    //----------------------------------------------------------
        // Remove Duplicate Recommendations
        //----------------------------------------------------------

        const uniqueRecommendations = [
            ...new Set(recommendations)
        ];

        //----------------------------------------------------------
        // Airport Operational Actions
        //----------------------------------------------------------

        if (maintenanceRequired) {

            uniqueRecommendations.push(
                "Deploy airport maintenance teams to inspect and maintain operational areas."
            );

        }

        if (runwayOperations === false) {

            uniqueRecommendations.push(
                "Suspend runway operations until safety conditions are restored."
            );

        }

        if (apronOperations === false) {

            uniqueRecommendations.push(
                "Restrict apron activities and ground handling operations."
            );

        }

        if (deicingOperationsRequired) {

            uniqueRecommendations.push(
                "Activate airport de-icing equipment and coordinate de-icing services."
            );

        }

        if (wildlifeInspectionRequired) {

            uniqueRecommendations.push(
                "Conduct wildlife hazard inspection and activate wildlife control measures."
            );

        }

        if (emergencyStandby) {

            uniqueRecommendations.push(
                "Place Airport Rescue and Fire Fighting (ARFF) services on heightened standby."
            );

        }

        if (notamRequired) {

            uniqueRecommendations.push(
                "Issue or update applicable NOTAMs for airport users."
            );

        }

        if (volcanicAsh.score > 0) {

            uniqueRecommendations.push(
                "Coordinate with the Meteorological Office and VAAC regarding volcanic ash advisories."
            );

        }

        if (thunderstorm.score >= 35) {

            uniqueRecommendations.push(
                "Suspend ramp operations whenever lightning safety limits are exceeded."
            );

        }

        if (wind.score >= 35) {

            uniqueRecommendations.push(
                "Secure loose ground equipment and review aircraft parking restrictions."
            );

        }

        if (precipitation.score >= 35) {

            uniqueRecommendations.push(
                "Inspect runway drainage systems and monitor surface water accumulation."
            );

        }

        if (visibility.score >= 35) {

            uniqueRecommendations.push(
                "Activate airport low visibility operational procedures."
            );

        }

        //----------------------------------------------------------
        // Build Operational Summary
        //----------------------------------------------------------

        const summary = [

            `Airport Status: ${airportStatus}`,

            runwayOperations
                ? "Runway Operations Available"
                : "Runway Operations Restricted",

            apronOperations
                ? "Apron Operations Normal"
                : "Apron Operations Restricted",

            terminalOperations
                ? "Terminal Operations Active"
                : "Terminal Operations Suspended",

            hazards.length > 0
                ? `Hazards: ${hazards.join(", ")}`
                : "No significant operational hazards."

        ].join(". ");

        //----------------------------------------------------------
        // Return Recommendation
        //----------------------------------------------------------

        return {

            airportStatus,

            runwayOperations,

            apronOperations,

            terminalOperations,

            maintenanceRequired,

            emergencyStandby,

            wildlifeInspectionRequired,

            deicingOperationsRequired,

            notamRequired,

            summary,

            hazards,

            recommendations: uniqueRecommendations

        };

    }

}