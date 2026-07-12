import { WeatherData } from "@prisma/client";

import {
    CanonicalWeatherObservation,
    HazardSeverity
} from "../../../models/weather/CanonicalWeatherObservation";

export class IcingMapper {

    /**
     * ==========================================================
     * Map Icing Parameters
     * ==========================================================
     */

    static map(
        weather: WeatherData,
        observation: CanonicalWeatherObservation
    ): void {

        //---------------------------------------------------------
        // Detect Icing
        //---------------------------------------------------------

        observation.icing =
            this.detectIcing(observation);

        //---------------------------------------------------------
        // Severity
        //---------------------------------------------------------

        observation.icingSeverity =
            this.determineSeverity(observation);

        //---------------------------------------------------------
        // Icing Layer
        //---------------------------------------------------------

        observation.icingBase =
            this.determineBase(observation);

        observation.icingTop =
            this.determineTop(observation);

        //---------------------------------------------------------
        // Supercooled Liquid Water
        //---------------------------------------------------------

        observation.supercooledLiquidWater =
            this.detectSLW(observation);

        //---------------------------------------------------------
        // Freezing Rain
        //---------------------------------------------------------

        observation.freezingRain =
            this.detectFreezingRain(observation);

        //---------------------------------------------------------
        // Freezing Drizzle
        //---------------------------------------------------------

        observation.freezingDrizzle =
            this.detectFreezingDrizzle(observation);

        //---------------------------------------------------------
        // Airport Operations
        //---------------------------------------------------------

        observation.deicingRequired =
            observation.icing ||
            observation.freezingRain ||
            observation.freezingDrizzle;

    }

    /**
     * ==========================================================
     * Detect Icing
     * ==========================================================
     */

    private static detectIcing(
        wx: CanonicalWeatherObservation
    ): boolean {

        const temperatureSuitable =

            wx.temperature <= 5 &&
            wx.temperature >= -20;

        const moisturePresent =

            (wx.relativeHumidity ?? 0) >= 80 ||

            wx.cloudAmount != null ||

            wx.precipitationType !== undefined ||

            wx.fog === true ||

            wx.mist === true;

        return temperatureSuitable && moisturePresent;

    }

    /**
     * ==========================================================
     * Determine Severity
     * ==========================================================
     */

    private static determineSeverity(
        wx: CanonicalWeatherObservation
    ): HazardSeverity {

        let score = 0;

        if (wx.temperature <= 0)
            score += 20;

        if ((wx.relativeHumidity ?? 0) >= 90)
            score += 20;

        if (wx.supercooledLiquidWater)
            score += 25;

        if (wx.freezingRain)
            score += 35;

        if (wx.freezingDrizzle)
            score += 15;

        if (wx.cloudAmount != null)
            score += 10;

        if (score == 0)
            return "NONE";

        if (score < 25)
            return "LIGHT";

        if (score < 50)
            return "MODERATE";

        if (score < 75)
            return "SEVERE";

        return "EXTREME";

    }

    /**
     * ==========================================================
     * Estimate Icing Base
     * ==========================================================
     */

    private static determineBase(
        wx: CanonicalWeatherObservation
    ): number | undefined {

        if (wx.cloudBase != null)
            return wx.cloudBase;

        if (wx.freezingLevel != null)
            return wx.freezingLevel;

        return undefined;

    }

    /**
     * ==========================================================
     * Estimate Icing Top
     * ==========================================================
     */

    private static determineTop(
        wx: CanonicalWeatherObservation
    ): number | undefined {

        if (wx.cloudTop != null)
            return wx.cloudTop;

        if (wx.cloudBase != null)
            return wx.cloudBase + 8000;

        if (wx.freezingLevel != null)
            return wx.freezingLevel + 8000;

        return undefined;

    }

    /**
     * ==========================================================
     * Detect Supercooled Liquid Water
     * ==========================================================
     */

    private static detectSLW(
        wx: CanonicalWeatherObservation
    ): boolean {

        return (

            wx.temperature < 0 &&

            wx.temperature > -20 &&

            (wx.relativeHumidity ?? 0) >= 90 &&

            wx.precipitationType === "RAIN"

        );

    }

    /**
     * ==========================================================
     * Detect Freezing Rain
     * ==========================================================
     */

    private static detectFreezingRain(
        wx: CanonicalWeatherObservation
    ): boolean {

        return (

            wx.temperature <= 0 &&

            wx.precipitationType === "FREEZING_RAIN"

        );

    }

    /**
     * ==========================================================
     * Detect Freezing Drizzle
     * ==========================================================
     */

    private static detectFreezingDrizzle(
        wx: CanonicalWeatherObservation
    ): boolean {

        return (

            wx.temperature <= 0 &&

            wx.precipitationType === "FREEZING_DRIZZLE"

        );

    }

}