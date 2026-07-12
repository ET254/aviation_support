import { WeatherData } from "@prisma/client";

import {
    CanonicalWeatherObservation,
    HazardSeverity
} from "../../../models/weather/CanonicalWeatherObservation";

export class TurbulenceMapper {

    /**
     * ==========================================================
     * Map Turbulence Parameters
     * ==========================================================
     */

    static map(
        weather: WeatherData,
        observation: CanonicalWeatherObservation
    ): void {

        //---------------------------------------------------------
        // Turbulence Present
        //---------------------------------------------------------

        observation.turbulence =
            this.detectTurbulence(observation);

        //---------------------------------------------------------
        // Severity
        //---------------------------------------------------------

        observation.turbulenceSeverity =
            this.determineSeverity(observation);

        //---------------------------------------------------------
        // Estimated Layer
        //---------------------------------------------------------

        observation.turbulenceBase =
            this.estimateBase(observation);

        observation.turbulenceTop =
            this.estimateTop(observation);

        //---------------------------------------------------------
        // Clear Air Turbulence
        //---------------------------------------------------------

        observation.clearAirTurbulence =
            this.detectCAT(observation);

        //---------------------------------------------------------
        // Mountain Wave
        //---------------------------------------------------------

        observation.mountainWave =
            this.detectMountainWave(observation);

        //---------------------------------------------------------
        // Rotor Cloud
        //---------------------------------------------------------

        observation.rotorCloud =
            observation.mountainWave &&
            observation.cloudBase != null &&
            observation.cloudBase < 6000;

    }

    /**
     * ==========================================================
     * Detect Turbulence
     * ==========================================================
     */

    private static detectTurbulence(
        wx: CanonicalWeatherObservation
    ): boolean {

        if ((wx.windGust ?? 0) >= 20)
            return true;

        if ((wx.crosswindComponent ?? 0) >= 20)
            return true;

        if (wx.lowLevelWindShear)
            return true;

        if (wx.thunderstorm)
            return true;

        if (wx.cumulonimbus)
            return true;

        return false;

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

        score += wx.windGust ?? 0;

        score += (wx.crosswindComponent ?? 0) * 0.5;

        if (wx.lowLevelWindShear)
            score += 20;

        if (wx.thunderstorm)
            score += 30;

        if (wx.cumulonimbus)
            score += 20;

        if (score < 20)
            return "NONE";

        if (score < 40)
            return "LIGHT";

        if (score < 60)
            return "MODERATE";

        if (score < 85)
            return "SEVERE";

        return "EXTREME";

    }

    /**
     * ==========================================================
     * Turbulence Layer Base
     * ==========================================================
     */

    private static estimateBase(
        wx: CanonicalWeatherObservation
    ): number | undefined {

        if (wx.lowLevelWindShear)
            return 500;

        if (wx.cloudBase)
            return wx.cloudBase;

        return undefined;

    }

    /**
     * ==========================================================
     * Turbulence Layer Top
     * ==========================================================
     */

    private static estimateTop(
        wx: CanonicalWeatherObservation
    ): number | undefined {

        if (wx.cumulonimbus)
            return 45000;

        if (wx.cloudTop)
            return wx.cloudTop;

        if (wx.cloudBase)
            return wx.cloudBase + 5000;

        return undefined;

    }

    /**
     * ==========================================================
     * Detect Clear Air Turbulence
     * ==========================================================
     */

    private static detectCAT(
        wx: CanonicalWeatherObservation
    ): boolean {

        return (

            (wx.jetStreamSpeed ?? 0) >= 80 &&

            !wx.thunderstorm &&

            !wx.cumulonimbus

        );

    }

    /**
     * ==========================================================
     * Detect Mountain Wave
     * ==========================================================
     */

    private static detectMountainWave(
        wx: CanonicalWeatherObservation
    ): boolean {

        const elevation =
            wx.elevation ?? 0;

        return (

            elevation >= 5000 &&

            wx.windSpeed >= 25

        );

    }

}