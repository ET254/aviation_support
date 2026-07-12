import { WeatherData } from "@prisma/client";

import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";

export class RunwayMapper {

    /**
     * ==========================================================
     * Map Runway Conditions
     * ==========================================================
     */

    static map(
        weather: WeatherData,
        observation: CanonicalWeatherObservation
    ): void {

        //---------------------------------------------------------
        // Runway Condition
        //---------------------------------------------------------

        observation.runwayCondition =
            this.determineRunwayCondition(
                observation
            );

        //---------------------------------------------------------
        // Estimated Surface Contamination
        //---------------------------------------------------------

        observation.runwayContaminationPercent =
            this.calculateContamination(
                observation
            );

        //---------------------------------------------------------
        // Estimated Friction Coefficient
        //---------------------------------------------------------

        observation.runwayFrictionCoefficient =
            this.calculateFriction(
                observation
            );

        //---------------------------------------------------------
        // Braking Action
        //---------------------------------------------------------

        observation.brakingAction =
            this.determineBrakingAction(
                observation.runwayFrictionCoefficient
            );

        //---------------------------------------------------------
        // Standing Water
        //---------------------------------------------------------

        observation.standingWater =
            this.hasStandingWater(
                observation
            );

        //---------------------------------------------------------
        // Snow / Slush
        //---------------------------------------------------------

        observation.snowDepth ??= 0;

        observation.slushDepth ??= 0;

        //---------------------------------------------------------
        // Runway Operational Flag
        //---------------------------------------------------------

        observation.runwayOperational =
            observation.runwayCondition !== "ICE";

    }

    /**
     * ==========================================================
     * Determine Runway Surface Condition
     * ==========================================================
     */

    private static determineRunwayCondition(
        wx: CanonicalWeatherObservation
    ) {

        if (wx.icing)
            return "ICE";

        if (wx.snowDepth && wx.snowDepth > 0)
            return "SNOW";

        if (wx.slushDepth && wx.slushDepth > 0)
            return "SLUSH";

        if (
            wx.precipitationType === "RAIN" ||
            wx.precipitationType === "DRIZZLE"
        ) {

            return "WET";

        }

        if (
            wx.relativeHumidity &&
            wx.relativeHumidity >= 90
        ) {

            return "DAMP";

        }

        return "DRY";

    }

    /**
     * ==========================================================
     * Surface Contamination %
     * ==========================================================
     */

    private static calculateContamination(
        wx: CanonicalWeatherObservation
    ): number {

        switch (wx.runwayCondition) {

            case "DRY":
                return 0;

            case "DAMP":
                return 15;

            case "WET":
                return 35;

            case "SLUSH":
                return 70;

            case "SNOW":
                return 80;

            case "ICE":
                return 100;

            default:
                return 0;

        }

    }

    /**
     * ==========================================================
     * Estimated Friction Coefficient
     * ==========================================================
     */

    private static calculateFriction(
        wx: CanonicalWeatherObservation
    ): number {

        switch (wx.runwayCondition) {

            case "DRY":
                return 0.70;

            case "DAMP":
                return 0.55;

            case "WET":
                return 0.42;

            case "SLUSH":
                return 0.32;

            case "SNOW":
                return 0.28;

            case "ICE":
                return 0.15;

            default:
                return 0.50;

        }

    }

    /**
     * ==========================================================
     * Braking Action
     * ==========================================================
     */

    private static determineBrakingAction(
        friction?: number
    ):
        | "GOOD"
        | "GOOD_TO_MEDIUM"
        | "MEDIUM"
        | "MEDIUM_TO_POOR"
        | "POOR"
        | "UNRELIABLE" {

        if (friction == null)
            return "UNRELIABLE";

        if (friction >= 0.60)
            return "GOOD";

        if (friction >= 0.45)
            return "GOOD_TO_MEDIUM";

        if (friction >= 0.35)
            return "MEDIUM";

        if (friction >= 0.25)
            return "MEDIUM_TO_POOR";

        return "POOR";

    }

    /**
     * ==========================================================
     * Standing Water Estimate
     * ==========================================================
     */

    private static hasStandingWater(
        wx: CanonicalWeatherObservation
    ): boolean {

        return (

            wx.precipitationType === "RAIN" &&

            (
                wx.precipitationIntensity === "HEAVY" ||

                wx.precipitationIntensity === "VIOLENT"

            )

        );

    }

}