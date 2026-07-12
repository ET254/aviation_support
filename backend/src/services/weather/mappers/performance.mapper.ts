import {
    CanonicalWeatherObservation
} from "../../../models/weather/CanonicalWeatherObservation";

export class PerformanceMapper {

    /**
     * ==========================================================
     * Performance Mapping
     * ==========================================================
     */

    static map(
        observation: CanonicalWeatherObservation
    ): void {

        //---------------------------------------------------------
        // Pressure Altitude
        //---------------------------------------------------------

        observation.pressureAltitude =
            this.calculatePressureAltitude(observation);

        //---------------------------------------------------------
        // Density Altitude
        //---------------------------------------------------------

        if (
            observation.densityAltitude == null
        ) {

            observation.densityAltitude =
                this.calculateDensityAltitude(
                    observation
                );

        }

        //---------------------------------------------------------
        // Operational Readiness
        //---------------------------------------------------------

        observation.operationalReadinessIndex =
            this.calculateOperationalReadiness(
                observation
            );

        //---------------------------------------------------------
        // Flight Risk
        //---------------------------------------------------------

        observation.flightRiskIndex =
            this.calculateFlightRisk(
                observation
            );

        //---------------------------------------------------------
        // Runway Risk
        //---------------------------------------------------------

        observation.runwayRiskIndex =
            this.calculateRunwayRisk(
                observation
            );

        //---------------------------------------------------------
        // Weather Severity
        //---------------------------------------------------------

        observation.weatherSeverityIndex =
            this.calculateWeatherSeverity(
                observation
            );

    }

    /**
     * ==========================================================
     * Pressure Altitude
     * ==========================================================
     */

    private static calculatePressureAltitude(
        wx: CanonicalWeatherObservation
    ): number {

        const elevation =
            wx.elevation ?? 0;

        const qnh =
            wx.qnh ?? 1013.25;

        return Math.round(

            elevation +

            (1013.25 - qnh) * 30

        );

    }

    /**
     * ==========================================================
     * Density Altitude
     * ==========================================================
     */

    private static calculateDensityAltitude(
        wx: CanonicalWeatherObservation
    ): number {

        const pressureAltitude =
            this.calculatePressureAltitude(wx);

        const isaTemp =
            15 - (pressureAltitude / 1000) * 2;

        return Math.round(

            pressureAltitude +

            120 *

            (wx.temperature - isaTemp)

        );

    }

    /**
     * ==========================================================
     * Operational Readiness Index
     * ==========================================================
     */

    private static calculateOperationalReadiness(
        wx: CanonicalWeatherObservation
    ): number {

        let score = 100;

        if (wx.visibility < 5000)
            score -= 15;

        if ((wx.windSpeed ?? 0) > 25)
            score -= 15;

        if ((wx.windGust ?? 0) > 35)
            score -= 15;

        if (wx.thunderstorm)
            score -= 25;

        if (wx.icing)
            score -= 20;

        if (wx.turbulence)
            score -= 15;

        if (wx.volcanicAsh)
            score = 0;

        return Math.max(0, score);

    }

    /**
     * ==========================================================
     * Flight Risk Index
     * ==========================================================
     */

    private static calculateFlightRisk(
        wx: CanonicalWeatherObservation
    ): number {

        let score = 0;

        if (wx.visibility < 5000)
            score += 20;

        if ((wx.windSpeed ?? 0) > 20)
            score += 15;

        if ((wx.windGust ?? 0) > 30)
            score += 15;

        if (wx.thunderstorm)
            score += 25;

        if (wx.icing)
            score += 20;

        if (wx.turbulence)
            score += 15;

        if (wx.volcanicAsh)
            score = 100;

        return Math.min(100, score);

    }

    /**
     * ==========================================================
     * Runway Risk Index
     * ==========================================================
     */

    private static calculateRunwayRisk(
        wx: CanonicalWeatherObservation
    ): number {

        let score = 0;

        switch (wx.runwayCondition) {

            case "DAMP":
                score += 10;
                break;

            case "WET":
                score += 20;
                break;

            case "SLUSH":
                score += 40;
                break;

            case "SNOW":
                score += 50;
                break;

            case "ICE":
                score += 70;
                break;

        }

        if (wx.standingWater)
            score += 15;

        if (
            (wx.runwayFrictionCoefficient ?? 1) < 0.30
        ) {

            score += 20;

        }

        return Math.min(score, 100);

    }

    /**
     * ==========================================================
     * Weather Severity Index
     * ==========================================================
     */

    private static calculateWeatherSeverity(
        wx: CanonicalWeatherObservation
    ): number {

        let severity = 0;

        if (wx.visibility < 1500)
            severity += 20;

        if ((wx.windSpeed ?? 0) > 30)
            severity += 20;

        if (wx.thunderstorm)
            severity += 20;

        if (wx.icing)
            severity += 15;

        if (wx.turbulence)
            severity += 10;

        if (wx.volcanicAsh)
            severity += 40;

        return Math.min(100, severity);

    }

}