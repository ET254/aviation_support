import { WeatherData } from "@prisma/client";
import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";

export class VisibilityMapper {

    /**
     * ==========================================================
     * Map Visibility Information
     * ==========================================================
     */

    static map(
        weather: WeatherData,
        observation: CanonicalWeatherObservation
    ): void {

        //---------------------------------------------------------
        // Main visibility
        //---------------------------------------------------------

        observation.visibility =
            weather.visibility ?? 9999;

        observation.prevailingVisibility =
            observation.visibility;

        observation.minimumVisibility =
            observation.visibility;

        //---------------------------------------------------------
        // Runway Visual Range
        //---------------------------------------------------------

        observation.rvr =
            weather.rvr ?? undefined;

        observation.runwayVisualRange =
            weather.rvr ?? undefined;

        //---------------------------------------------------------
        // Directional Visibility
        //---------------------------------------------------------

        observation.visibilityNorth =
            observation.visibility;

        observation.visibilitySouth =
            observation.visibility;

        observation.visibilityEast =
            observation.visibility;

        observation.visibilityWest =
            observation.visibility;

        //---------------------------------------------------------
        // Vertical Visibility
        //---------------------------------------------------------

        observation.verticalVisibility =
            undefined;

        //---------------------------------------------------------
        // Obscurations
        //---------------------------------------------------------

        observation.obscurations = [];

        if (observation.fog)
            observation.obscurations.push("FG");

        if (observation.mist)
            observation.obscurations.push("BR");

        if (observation.haze)
            observation.obscurations.push("HZ");

        if (observation.smoke)
            observation.obscurations.push("FU");

        if (observation.blowingDust)
            observation.obscurations.push("BLDU");

        if (observation.blowingSand)
            observation.obscurations.push("BLSA");

        if (observation.blowingSnow)
            observation.obscurations.push("BLSN");

        //---------------------------------------------------------
        // Flight Category
        //---------------------------------------------------------

        observation.flightCategory =
            this.determineFlightCategory(
                observation.visibility,
                observation.ceiling
            );

    }

    /**
     * ==========================================================
     * Determine Flight Category
     * ICAO/FAA-style operational thresholds
     * ==========================================================
     */

    private static determineFlightCategory(

        visibility: number,

        ceiling?: number

    ):
        | "VFR"
        | "MVFR"
        | "IFR"
        | "LIFR" {

        const vis = visibility ?? 9999;

        const ceil = ceiling ?? 99999;

        //---------------------------------------------------------
        // LIFR
        //---------------------------------------------------------

        if (
            vis < 800 ||
            ceil < 500
        ) {

            return "LIFR";

        }

        //---------------------------------------------------------
        // IFR
        //---------------------------------------------------------

        if (
            vis < 3000 ||
            ceil < 1000
        ) {

            return "IFR";

        }

        //---------------------------------------------------------
        // MVFR
        //---------------------------------------------------------

        if (
            vis < 5000 ||
            ceil < 3000
        ) {

            return "MVFR";

        }

        //---------------------------------------------------------
        // VFR
        //---------------------------------------------------------

        return "VFR";

    }

}