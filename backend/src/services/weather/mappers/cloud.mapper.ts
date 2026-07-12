import { WeatherData, CloudType } from "@prisma/client";
import {
    CanonicalWeatherObservation,
    CloudLayer
} from "../../../models/weather/CanonicalWeatherObservation";

export class CloudMapper {

    /**
     * ==========================================================
     * Map Cloud Information
     * ==========================================================
     */

    static map(
        weather: WeatherData,
        observation: CanonicalWeatherObservation
    ): void {

        //---------------------------------------------------------
        // Cloud amount (oktas)
        //---------------------------------------------------------

        observation.cloudAmount =
            weather.cloudAmount ?? 0;

        //---------------------------------------------------------
        // Cloud base
        //---------------------------------------------------------

        observation.cloudBase =
            weather.cloudBase ?? undefined;

        //---------------------------------------------------------
        // Cloud top
        //---------------------------------------------------------

        observation.cloudTop =
            undefined;

        //---------------------------------------------------------
        // Cloud type
        //---------------------------------------------------------

        observation.cloudType =
            this.mapCloudType(
                weather.cloudType
            );

        //---------------------------------------------------------
        // Ceiling
        //---------------------------------------------------------

        observation.ceiling =
            this.calculateCeiling(
                weather
            );

        //---------------------------------------------------------
        // Broken / Overcast Heights
        //---------------------------------------------------------

        observation.brokenLayerHeight =
            weather.cloudType === CloudType.BROKEN
                ? weather.cloudBase ?? undefined
                : undefined;

        observation.overcastLayerHeight =
            weather.cloudType === CloudType.OVERCAST
                ? weather.cloudBase ?? undefined
                : undefined;

        //---------------------------------------------------------
        // Convective Clouds
        //---------------------------------------------------------

        observation.convectiveClouds =
            this.isConvective(
                observation.cloudType
            );

        observation.cumulonimbus =
            observation.cloudType === "CB";

        observation.toweringCumulus =
            observation.cloudType === "TCU";

        //---------------------------------------------------------
        // Cloud Layers
        //---------------------------------------------------------

        observation.cloudLayers =
            this.buildLayers(weather);

    }

    /**
     * ==========================================================
     * Convert Prisma CloudType
     * ==========================================================
     */

    private static mapCloudType(
        type: CloudType | null
    ): string | undefined {

        if (!type)
            return undefined;

        switch (type) {

            case CloudType.CLEAR:
                return "CLR";

            case CloudType.FEW:
                return "FEW";

            case CloudType.SCATTERED:
                return "SCT";

            case CloudType.BROKEN:
                return "BKN";

            case CloudType.OVERCAST:
                return "OVC";

            case CloudType.VERTICAL_DEVELOPMENT:
                return "TCU";

            default:
                return undefined;

        }

    }

    /**
     * ==========================================================
     * Build ICAO Cloud Layer
     * ==========================================================
     */

    private static buildLayers(
        weather: WeatherData
    ): CloudLayer[] {

        if (
            weather.cloudAmount == null ||
            weather.cloudBase == null
        ) {

            return [];

        }

        let amount:
            CloudLayer["amount"];

        const oktas =
            weather.cloudAmount;

        if (oktas <= 0)
            amount = "CLR";

        else if (oktas <= 2)
            amount = "FEW";

        else if (oktas <= 4)
            amount = "SCT";

        else if (oktas <= 7)
            amount = "BKN";

        else
            amount = "OVC";

        return [

            {

                amount,

                base: weather.cloudBase,

                type:
                    this.layerType(
                        weather.cloudType
                    )

            }

        ];

    }

    /**
     * ==========================================================
     * Cloud Species
     * ==========================================================
     */

    private static layerType(
        type: CloudType | null
    ): CloudLayer["type"] | undefined {

        if (!type)
            return undefined;

        switch (type) {

            case CloudType.VERTICAL_DEVELOPMENT:
                return "TCU";

            default:
                return undefined;

        }

    }

    /**
     * ==========================================================
     * Ceiling
     * ==========================================================
     */

    private static calculateCeiling(
        weather: WeatherData
    ): number | undefined {

        if (
            weather.cloudBase == null ||
            weather.cloudType == null
        ) {

            return undefined;

        }

        switch (weather.cloudType) {

            case CloudType.BROKEN:

            case CloudType.OVERCAST:

                return weather.cloudBase;

            default:

                return undefined;

        }

    }

    /**
     * ==========================================================
     * Convective Clouds
     * ==========================================================
     */

    private static isConvective(
        type?: string
    ): boolean {

        return (
            type === "CB" ||
            type === "TCU"
        );

    }

}