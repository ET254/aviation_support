import { WeatherData } from "@prisma/client";
import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";

export class PressureMapper {

    /**
     * ============================================================
     * Map Pressure Information
     * ============================================================
     */
    static map(
        weather: WeatherData,
        observation: Partial<CanonicalWeatherObservation>
    ): void {

        //---------------------------------------------------------
        // QNH
        //---------------------------------------------------------

        observation.qnh =
            weather.pressureQnh ?? 1013.25;

        //---------------------------------------------------------
        // QFE
        //---------------------------------------------------------

        observation.qfe =
            weather.pressureQfe ?? undefined;

        //---------------------------------------------------------
        // Altimeter
        //---------------------------------------------------------

        observation.altimeter =
            weather.pressureQnh != null
                ? this.qnhToAltimeter(weather.pressureQnh)
                : undefined;

        //---------------------------------------------------------
        // Pressure Tendency
        //---------------------------------------------------------

        observation.pressureTendency =
            undefined;

    }

    /**
     * ============================================================
     * Convert QNH (hPa) → Altimeter (inHg)
     * ============================================================
     *
     * Formula:
     * 1 hPa = 0.0295299830714 inHg
     *
     * Example:
     * 1013.25 hPa = 29.92 inHg
     *
     * ============================================================
     */

    private static qnhToAltimeter(
        qnh: number
    ): number {

        return Number(
            (qnh * 0.0295299830714).toFixed(2)
        );

    }

}