import {
    WeatherData,
    PrecipitationType
} from "@prisma/client";

import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";

export class PrecipitationMapper {

    /**
     * ==========================================================
     * Map Precipitation Information
     * ==========================================================
     */

    static map(
        weather: WeatherData,
        observation: CanonicalWeatherObservation
    ): void {

        //---------------------------------------------------------
        // Type
        //---------------------------------------------------------

        observation.precipitationType =
            this.mapType(
                weather.precipitationType
            );

        //---------------------------------------------------------
        // Intensity
        //---------------------------------------------------------

        observation.precipitationIntensity =
            this.mapIntensity(
                weather.precipitationIntensity
            );

        //---------------------------------------------------------
        // Rate
        //---------------------------------------------------------

        observation.precipitationRate =
            weather.precipitationIntensity ?? undefined;

        //---------------------------------------------------------
        // Accumulation
        //---------------------------------------------------------

        observation.accumulation =
            undefined;

        //---------------------------------------------------------
        // Derived Hazards
        //---------------------------------------------------------

        observation.hail =
            weather.precipitationType ===
            PrecipitationType.HAIL;

        observation.freezingRain =
            weather.precipitationType ===
            PrecipitationType.FREEZING_RAIN;

        observation.freezingDrizzle =
            false;

        //---------------------------------------------------------
        // Basic Hazard Flags
        //---------------------------------------------------------

        observation.snowDepth ??= 0;

        observation.slushDepth ??= 0;

    }

    /**
     * ==========================================================
     * Convert Prisma Precipitation Type
     * ==========================================================
     */

    private static mapType(
        type: PrecipitationType | null
    ):
        | "NONE"
        | "RAIN"
        | "DRIZZLE"
        | "SNOW"
        | "SLEET"
        | "HAIL"
        | "FREEZING_RAIN"
        | "FREEZING_DRIZZLE"
        | "ICE_PELLETS"
        | undefined {

        if (!type)
            return "NONE";

        switch (type) {

            case PrecipitationType.NONE:
                return "NONE";

            case PrecipitationType.RAIN:
                return "RAIN";

            case PrecipitationType.SNOW:
                return "SNOW";

            case PrecipitationType.SLEET:
                return "SLEET";

            case PrecipitationType.HAIL:
                return "HAIL";

            case PrecipitationType.FREEZING_RAIN:
                return "FREEZING_RAIN";

            default:
                return "NONE";

        }

    }

    /**
     * ==========================================================
     * Convert Intensity
     * ==========================================================
     */

    private static mapIntensity(
        intensity: number | null
    ):
        | "NONE"
        | "LIGHT"
        | "MODERATE"
        | "HEAVY"
        | "VIOLENT" {

        if (
            intensity == null ||
            intensity <= 0
        ) {

            return "NONE";

        }

        if (intensity < 2)
            return "LIGHT";

        if (intensity < 8)
            return "MODERATE";

        if (intensity < 20)
            return "HEAVY";

        return "VIOLENT";

    }

}