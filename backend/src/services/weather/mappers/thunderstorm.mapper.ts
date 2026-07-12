import { WeatherData } from "@prisma/client";

import {
    CanonicalWeatherObservation
} from "../../../models/weather/CanonicalWeatherObservation";

export class ThunderstormMapper {

    /**
     * ==========================================================
     * Map Thunderstorm Parameters
     * ==========================================================
     */

    static map(
        weather: WeatherData,
        observation: CanonicalWeatherObservation
    ): void {

        //---------------------------------------------------------
        // Thunderstorm
        //---------------------------------------------------------

        observation.thunderstorm =
            this.detectThunderstorm(observation);

        //---------------------------------------------------------
        // Lightning
        //---------------------------------------------------------

        observation.lightning =
            this.detectLightning(observation);

        //---------------------------------------------------------
        // Hail
        //---------------------------------------------------------

        observation.hail =
            this.detectHail(observation);

        //---------------------------------------------------------
        // Squall
        //---------------------------------------------------------

        observation.squall =
            this.detectSquall(observation);

        //---------------------------------------------------------
        // Tornado
        //---------------------------------------------------------

        observation.tornado =
            this.detectTornado(observation);

        //---------------------------------------------------------
        // Funnel Cloud
        //---------------------------------------------------------

        observation.funnelCloud =
            this.detectFunnelCloud(observation);

    }

    /**
     * ==========================================================
     * Thunderstorm Detection
     * ==========================================================
     */

    private static detectThunderstorm(
        wx: CanonicalWeatherObservation
    ): boolean {

        return (

            wx.cumulonimbus === true ||

            wx.toweringCumulus === true ||

            wx.cloudLayers?.some(
                layer => layer.type === "CB"
            ) === true

        );

    }

    /**
     * ==========================================================
     * Lightning Detection
     * ==========================================================
     */

    private static detectLightning(
        wx: CanonicalWeatherObservation
    ): boolean {

        return (

            wx.thunderstorm === true ||

            wx.cumulonimbus === true

        );

    }

    /**
     * ==========================================================
     * Hail Detection
     * ==========================================================
     */

    private static detectHail(
        wx: CanonicalWeatherObservation
    ): boolean {

        return (

            wx.precipitationType === "HAIL"

        );

    }

    /**
     * ==========================================================
     * Squall Detection
     * ==========================================================
     */

    private static detectSquall(
        wx: CanonicalWeatherObservation
    ): boolean {

        return (

            (wx.windGust ?? 0) >= 35 &&

            wx.thunderstorm === true

        );

    }

    /**
     * ==========================================================
     * Tornado Detection
     * ==========================================================
     */

    private static detectTornado(
        wx: CanonicalWeatherObservation
    ): boolean {

        return false;

    }

    /**
     * ==========================================================
     * Funnel Cloud Detection
     * ==========================================================
     */

    private static detectFunnelCloud(
        wx: CanonicalWeatherObservation
    ): boolean {

        return false;

    }

}