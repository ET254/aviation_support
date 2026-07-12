import {
    CanonicalWeatherObservation,
    FlightCategory
} from "../../../models/weather/CanonicalWeatherObservation";

export class FlightCategoryMapper {

    /**
     * ==========================================================
     * Determine Flight Category
     * ==========================================================
     */

    static map(
        observation: CanonicalWeatherObservation
    ): void {

        observation.flightCategory =
            this.calculateCategory(observation);

        //---------------------------------------------------------
        // Operational Flags
        //---------------------------------------------------------

        observation.vfrAllowed =
            observation.flightCategory === "VFR" ||
            observation.flightCategory === "MVFR";

        observation.ifrRequired =
            observation.flightCategory === "IFR" ||
            observation.flightCategory === "LIFR";

    }

    /**
     * ==========================================================
     * ICAO Flight Category
     * ==========================================================
     */

    private static calculateCategory(
        wx: CanonicalWeatherObservation
    ): FlightCategory {

        const visibility =
            wx.visibility ?? 99999;

        const ceiling =
            this.determineCeiling(wx);

        //---------------------------------------------------------
        // LIFR
        //---------------------------------------------------------

        if (
            visibility < 1600 ||
            ceiling < 500
        ) {

            return "LIFR";

        }

        //---------------------------------------------------------
        // IFR
        //---------------------------------------------------------

        if (
            visibility < 4800 ||
            ceiling < 1000
        ) {

            return "IFR";

        }

        //---------------------------------------------------------
        // MVFR
        //---------------------------------------------------------

        if (
            visibility < 8000 ||
            ceiling < 3000
        ) {

            return "MVFR";

        }

        //---------------------------------------------------------
        // VFR
        //---------------------------------------------------------

        return "VFR";

    }

    /**
     * ==========================================================
     * Ceiling Determination
     * ==========================================================
     */

    private static determineCeiling(
        wx: CanonicalWeatherObservation
    ): number {

        //---------------------------------------------------------
        // Already calculated
        //---------------------------------------------------------

        if (
            wx.ceiling != null
        ) {

            return wx.ceiling;

        }

        //---------------------------------------------------------
        // OVC layer
        //---------------------------------------------------------

        if (
            wx.overcastLayerHeight != null
        ) {

            return wx.overcastLayerHeight;

        }

        //---------------------------------------------------------
        // BKN layer
        //---------------------------------------------------------

        if (
            wx.brokenLayerHeight != null
        ) {

            return wx.brokenLayerHeight;

        }

        //---------------------------------------------------------
        // Cloud Layers
        //---------------------------------------------------------

        if (
            wx.cloudLayers?.length
        ) {

            const ceilingLayers =
                wx.cloudLayers.filter(

                    layer =>

                        layer.amount === "BKN" ||

                        layer.amount === "OVC"

                );

            if (
                ceilingLayers.length > 0
            ) {

                return Math.min(

                    ...ceilingLayers.map(

                        layer => layer.base

                    )

                );

            }

        }

        //---------------------------------------------------------
        // Unlimited Ceiling
        //---------------------------------------------------------

        return 99999;

    }

}