import {
    CanonicalWeatherObservation
} from "../../../models/weather/CanonicalWeatherObservation";

export class DerivedValuesMapper {

    /**
     * ==========================================================
     * Calculate All Derived Values
     * ==========================================================
     */

    static map(
        observation: CanonicalWeatherObservation
    ): void {

        //---------------------------------------------------------
        // Observation Age
        //---------------------------------------------------------

        observation.observationAgeMinutes =
            this.calculateObservationAge(
                observation.timestamp
            );

        //---------------------------------------------------------
        // Relative Humidity
        //---------------------------------------------------------

        if (
            observation.relativeHumidity == null
        ) {

            observation.relativeHumidity =
                this.calculateRelativeHumidity(
                    observation.temperature,
                    observation.dewPoint
                );

        }

        //---------------------------------------------------------
        // Density Index
        //---------------------------------------------------------

        observation.densityIndex =
            this.calculateDensityIndex(
                observation
            );

        //---------------------------------------------------------
        // Confidence
        //---------------------------------------------------------

        observation.confidence =
            this.calculateConfidence(
                observation
            );

        //---------------------------------------------------------
        // Confidence Level
        //---------------------------------------------------------

        observation.confidenceLevel =
            this.determineConfidenceLevel(
                observation.confidence
            );

        //---------------------------------------------------------
        // Airport Operational Flags
        //---------------------------------------------------------

        observation.airportOperational =
            !observation.volcanicAsh;

        observation.runwayOperational =
            observation.runwayRiskIndex == null
                ? true
                : observation.runwayRiskIndex < 80;

        observation.departuresAllowed =
            observation.operationalReadinessIndex != null &&
            observation.operationalReadinessIndex >= 40;

        observation.arrivalsAllowed =
            observation.operationalReadinessIndex != null &&
            observation.operationalReadinessIndex >= 40;

        observation.alternateAirportRecommended =
            (observation.flightRiskIndex ?? 0) >= 60;

        observation.diversionRecommended =
            (observation.flightRiskIndex ?? 0) >= 80;

        observation.holdingRecommended =
            observation.thunderstorm === true;

        observation.deicingRequired =
            observation.icing === true ||
            observation.freezingRain === true ||
            observation.freezingDrizzle === true;

    }

    /**
     * ==========================================================
     * Observation Age
     * ==========================================================
     */

    private static calculateObservationAge(
        timestamp: Date
    ): number {

        return Math.max(

            0,

            Math.round(

                (Date.now() - timestamp.getTime()) /

                60000

            )

        );

    }

    /**
     * ==========================================================
     * Relative Humidity
     * ==========================================================
     */

    private static calculateRelativeHumidity(
        temperature: number,
        dewPoint: number
    ): number {

        const es = Math.exp(
            (17.625 * temperature) /
            (243.04 + temperature)
        );

        const ed = Math.exp(
            (17.625 * dewPoint) /
            (243.04 + dewPoint)
        );

        return Math.round(

            Math.min(

                100,

                (ed / es) * 100

            )

        );

    }

    /**
     * ==========================================================
     * Density Index
     * ==========================================================
     */

    private static calculateDensityIndex(
        wx: CanonicalWeatherObservation
    ): number {

        if (
            wx.densityAltitude == null
        ) {

            return 0;

        }

        const densityIndex =
            wx.densityAltitude / 100;

        return Math.max(
            0,
            Math.min(
                100,
                Math.round(densityIndex)
            )
        );

    }

    /**
     * ==========================================================
     * Confidence
     * ==========================================================
     */

    private static calculateConfidence(
        wx: CanonicalWeatherObservation
    ): number {

        let confidence = 100;

        if (
            (wx.observationAgeMinutes ?? 0) > 60
        ) {

            confidence -= 15;

        }

        if (
            wx.dataQuality === "QC_PENDING"
        ) {

            confidence -= 10;

        }

        if (
            wx.dataQuality === "ESTIMATED"
        ) {

            confidence -= 20;

        }

        if (
            wx.dataQuality === "MODELLED"
        ) {

            confidence -= 15;

        }

        if (
            wx.source === "MODEL"
        ) {

            confidence -= 10;

        }

        return Math.max(
            0,
            Math.min(
                100,
                confidence
            )
        );

    }

    /**
     * ==========================================================
     * Confidence Level
     * ==========================================================
     */

    private static determineConfidenceLevel(
        confidence: number
    ):
        | "VERY_LOW"
        | "LOW"
        | "MEDIUM"
        | "HIGH"
        | "VERY_HIGH" {

        if (confidence >= 90)
            return "VERY_HIGH";

        if (confidence >= 75)
            return "HIGH";

        if (confidence >= 60)
            return "MEDIUM";

        if (confidence >= 40)
            return "LOW";

        return "VERY_LOW";

    }

}