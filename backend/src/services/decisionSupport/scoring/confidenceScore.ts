import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";

export interface ConfidenceBreakdown {

    overall: number;

    category:
        | "VERY_LOW"
        | "LOW"
        | "MEDIUM"
        | "HIGH"
        | "VERY_HIGH";

    source: number;

    completeness: number;

    freshness: number;

    quality: number;

    consistency: number;

    forecast: number;

    remarks: string[];

}

export class ConfidenceScore {

    /**
     * ---------------------------------------------------------
     * Main Confidence Calculator
     * ---------------------------------------------------------
     */
    static calculate(
        wx: CanonicalWeatherObservation
    ): ConfidenceBreakdown {

        const remarks: string[] = [];

        const source =
            this.sourceConfidence(wx, remarks);

        const completeness =
            this.completenessConfidence(wx, remarks);

        const freshness =
            this.freshnessConfidence(wx, remarks);

        const quality =
            this.qualityConfidence(wx, remarks);

        const consistency =
            this.consistencyConfidence(wx, remarks);

        const forecast =
            this.forecastConfidence(wx, remarks);

        const overall = Math.round(

            (
                source +
                completeness +
                freshness +
                quality +
                consistency +
                forecast

            ) / 6

        );

        return {

            overall,

            category:
                this.category(overall),

            source,

            completeness,

            freshness,

            quality,

            consistency,

            forecast,

            remarks

        };

    }

    /**
     * ---------------------------------------------------------
     * Source Confidence
     * ---------------------------------------------------------
     */

    private static sourceConfidence(
        wx: CanonicalWeatherObservation,
        remarks: string[]
    ): number {

        switch (wx.source) {

            case "METAR":
                return 100;

            case "SPECI":
                return 98;

            case "RADAR":
                return 94;

            case "SATELLITE":
                return 92;

            case "NETCDF":
                return 90;

            case "MODEL":
                return 88;

            case "TAF":
                return 85;

            case "SIGMET":
                return 85;

            case "AIRMET":
                return 82;

            case "MANUAL":

                remarks.push(
                    "Manual observation."
                );

                return 75;

            default:

                remarks.push(
                    "Unknown observation source."
                );

                return 50;

        }

    }

    /**
     * ---------------------------------------------------------
     * Completeness
     * ---------------------------------------------------------
     */

    private static completenessConfidence(
        wx: CanonicalWeatherObservation,
        remarks: string[]
    ): number {

        const requiredFields = [

            wx.temperature,
            wx.dewPoint,
            wx.windSpeed,
            wx.windDirection,
            wx.visibility,
            wx.qnh

        ];

        const available =
            requiredFields.filter(

                value =>
                    value !== undefined &&
                    value !== null

            ).length;

        const score =
            Math.round(
                (available / requiredFields.length) * 100
            );

        if (score < 100) {

            remarks.push(
                "Some required weather parameters are missing."
            );

        }

        return score;

    }

        /**
     * ---------------------------------------------------------
     * Freshness Confidence
     * ---------------------------------------------------------
     */

    private static freshnessConfidence(
        wx: CanonicalWeatherObservation,
        remarks: string[]
    ): number {

        if (!wx.timestamp) {

            remarks.push(
                "Observation timestamp unavailable."
            );

            return 40;

        }

        const ageMinutes =
            (Date.now() - new Date(wx.timestamp).getTime()) /
            60000;

        if (ageMinutes <= 10)
            return 100;

        if (ageMinutes <= 20)
            return 95;

        if (ageMinutes <= 30)
            return 90;

        if (ageMinutes <= 60)
            return 80;

        if (ageMinutes <= 120)
            return 65;

        if (ageMinutes <= 180)
            return 50;

        remarks.push(
            "Weather observation is becoming stale."
        );

        return 35;

    }

    /**
     * ---------------------------------------------------------
     * Quality Confidence
     * ---------------------------------------------------------
     */

    private static qualityConfidence(
        wx: CanonicalWeatherObservation,
        remarks: string[]
    ): number {

        switch (wx.dataQuality) {

            case "QC_PASSED":
                return 100;

            case "RAW":

                remarks.push(
                    "Observation has not yet passed quality control."
                );

                return 80;

            case "QC_PENDING":

                remarks.push(
                    "Quality control pending."
                );

                return 75;

            case "ESTIMATED":

                remarks.push(
                    "Estimated weather values used."
                );

                return 65;

            case "MODELLED":

                remarks.push(
                    "Model-derived weather values."
                );

                return 70;

            default:

                remarks.push(
                    "Unknown quality status."
                );

                return 55;

        }

    }

    /**
     * ---------------------------------------------------------
     * Internal Consistency
     * ---------------------------------------------------------
     */

    private static consistencyConfidence(
        wx: CanonicalWeatherObservation,
        remarks: string[]
    ): number {

        let score = 100;

        if (
            wx.temperature != null &&
            wx.dewPoint != null &&
            wx.dewPoint > wx.temperature
        ) {

            remarks.push(
                "Dew point exceeds air temperature."
            );

            score -= 30;

        }

        if (
            wx.visibility != null &&
            wx.visibility < 0
        ) {

            remarks.push(
                "Negative visibility detected."
            );

            score -= 30;

        }

        if (
            wx.windSpeed != null &&
            wx.windSpeed < 0
        ) {

            remarks.push(
                "Negative wind speed detected."
            );

            score -= 30;

        }

        if (
            wx.windGust != null &&
            wx.windSpeed != null &&
            wx.windGust < wx.windSpeed
        ) {

            remarks.push(
                "Wind gust is lower than sustained wind."
            );

            score -= 10;

        }

        if (
            wx.relativeHumidity != null &&
            (
                wx.relativeHumidity < 0 ||
                wx.relativeHumidity > 100
            )
        ) {

            remarks.push(
                "Relative humidity outside physical limits."
            );

            score -= 20;

        }

        if (score < 0)
            score = 0;

        return score;

    }

    /**
     * ---------------------------------------------------------
     * Forecast Confidence
     * ---------------------------------------------------------
     */

    private static forecastConfidence(
        wx: CanonicalWeatherObservation,
        remarks: string[]
    ): number {

        let score = 100;

        if (wx.forecastHour != null) {

            if (wx.forecastHour > 72)
                score -= 35;

            else if (wx.forecastHour > 48)
                score -= 25;

            else if (wx.forecastHour > 24)
                score -= 15;

            else if (wx.forecastHour > 12)
                score -= 8;

        }

        switch (wx.forecastModel) {

            case "ECMWF":
                score += 4;
                break;

            case "WRF":
                score += 3;
                break;

            case "UKMO":
                score += 3;
                break;

            case "ICON":
                score += 2;
                break;

            case "GFS":
                score += 1;
                break;

            case "KMD":
                score += 2;
                break;

        }

        if (score > 100)
            score = 100;

        if (score < 0)
            score = 0;

        if (score < 70) {

            remarks.push(
                "Forecast confidence reduced because of forecast lead time."
            );

        }

        return score;

    }

        /**
     * ---------------------------------------------------------
     * Confidence Category
     * ---------------------------------------------------------
     */

    private static category(
        score: number
    ): ConfidenceBreakdown["category"] {

        if (score >= 95)
            return "VERY_HIGH";

        if (score >= 85)
            return "HIGH";

        if (score >= 70)
            return "MEDIUM";

        if (score >= 50)
            return "LOW";

        return "VERY_LOW";

    }

    /**
     * ---------------------------------------------------------
     * Convert confidence to text description
     * ---------------------------------------------------------
     */

    static describe(score: number): string {

        if (score >= 95)
            return "Observation is highly reliable and suitable for operational decision making.";

        if (score >= 85)
            return "Observation is reliable with only minor uncertainty.";

        if (score >= 70)
            return "Observation is usable but contains moderate uncertainty.";

        if (score >= 50)
            return "Observation should be used cautiously and cross-checked with additional sources.";

        return "Observation confidence is very low. Operational decisions should not rely solely on this data.";

    }

    /**
     * ---------------------------------------------------------
     * Can this observation be trusted?
     * ---------------------------------------------------------
     */

    static isOperationallyReliable(
        confidence: ConfidenceBreakdown
    ): boolean {

        return confidence.overall >= 70;

    }

    /**
     * ---------------------------------------------------------
     * Should another weather source be requested?
     * ---------------------------------------------------------
     */

    static requiresVerification(
        confidence: ConfidenceBreakdown
    ): boolean {

        return confidence.overall < 60;

    }

    /**
     * ---------------------------------------------------------
     * Confidence colour for dashboard
     * ---------------------------------------------------------
     */

    static dashboardColour(
        confidence: number
    ): string {

        if (confidence >= 95)
            return "#16a34a";   // Green

        if (confidence >= 85)
            return "#65a30d";   // Lime

        if (confidence >= 70)
            return "#f59e0b";   // Amber

        if (confidence >= 50)
            return "#f97316";   // Orange

        return "#dc2626";       // Red

    }

    /**
     * ---------------------------------------------------------
     * Confidence Badge
     * ---------------------------------------------------------
     */

    static badge(
        confidence: number
    ): string {

        if (confidence >= 95)
            return "★★★★★";

        if (confidence >= 85)
            return "★★★★☆";

        if (confidence >= 70)
            return "★★★☆☆";

        if (confidence >= 50)
            return "★★☆☆☆";

        return "★☆☆☆☆";

    }

}