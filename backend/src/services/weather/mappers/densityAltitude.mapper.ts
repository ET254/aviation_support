import { WeatherData } from "@prisma/client";

import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";

export class DensityAltitudeMapper {

    /**
     * ==========================================================
     * Map Density Altitude Parameters
     * ==========================================================
     */

    static map(
        weather: WeatherData,
        observation: CanonicalWeatherObservation
    ): void {

        //---------------------------------------------------------
        // Pressure Altitude
        //---------------------------------------------------------

        observation.pressureAltitude =
            this.calculatePressureAltitude(
                observation
            );

        //---------------------------------------------------------
        // Density Altitude
        //---------------------------------------------------------

        observation.densityAltitude =
            weather.densityAltitude ??
            this.calculateDensityAltitude(
                observation
            );

        //---------------------------------------------------------
        // Density Index
        //---------------------------------------------------------

        observation.densityIndex =
            this.calculateDensityIndex(
                observation.densityAltitude
            );

        //---------------------------------------------------------
        // Performance Flags
        //---------------------------------------------------------

        observation.departuresAllowed =
            observation.densityAltitude < 9000;

        observation.operationalReadinessIndex =
            this.operationalReadiness(
                observation.densityAltitude
            );

    }

    /**
     * ==========================================================
     * Pressure Altitude
     *
     * Formula:
     * PA = Elevation + (1013.25 - QNH) × 30
     * ==========================================================
     */

    private static calculatePressureAltitude(
        wx: CanonicalWeatherObservation
    ): number {

        const elevation =
            wx.elevation ?? 0;

        return Math.round(

            elevation +

            (1013.25 - wx.qnh) * 30

        );

    }

    /**
     * ==========================================================
     * Density Altitude
     *
     * Formula:
     * DA = PA + 120 × (OAT − ISA Temp)
     * ==========================================================
     */

    private static calculateDensityAltitude(
        wx: CanonicalWeatherObservation
    ): number {

        const pressureAltitude =
            wx.pressureAltitude ??
            this.calculatePressureAltitude(wx);

        const elevation =
            wx.elevation ?? 0;

        //---------------------------------------------------------
        // ISA Temperature
        //---------------------------------------------------------

        const isaTemperature =

            15 -

            (elevation / 1000) * 2;

        //---------------------------------------------------------
        // Density Altitude
        //---------------------------------------------------------

        const da =

            pressureAltitude +

            120 *

            (wx.temperature - isaTemperature);

        return Math.round(da);

    }

    /**
     * ==========================================================
     * Density Index
     * ==========================================================
     */

    private static calculateDensityIndex(
        densityAltitude?: number
    ): number {

        if (densityAltitude == null)
            return 0;

        if (densityAltitude <= 0)
            return 0;

        if (densityAltitude >= 12000)
            return 100;

        return Math.round(

            densityAltitude / 120

        );

    }

    /**
     * ==========================================================
     * Operational Readiness
     * ==========================================================
     */

    private static operationalReadiness(
        densityAltitude?: number
    ): number {

        if (densityAltitude == null)
            return 100;

        if (densityAltitude <= 2000)
            return 100;

        if (densityAltitude <= 4000)
            return 90;

        if (densityAltitude <= 6000)
            return 75;

        if (densityAltitude <= 8000)
            return 55;

        if (densityAltitude <= 10000)
            return 35;

        return 15;

    }

}