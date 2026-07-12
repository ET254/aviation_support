import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
import { AviationMath } from "../helpers/aviationMath";

export interface WindAssessment {

    windDirection: number;

    windSpeed: number;

    gust?: number;

    crosswind: number;

    headwind: number;

    tailwind: number;

    severity:
        | "NONE"
        | "LOW"
        | "MODERATE"
        | "HIGH"
        | "EXTREME";

    score: number;

    operationalStatus:
        | "NORMAL"
        | "CAUTION"
        | "RESTRICTED"
        | "CRITICAL";

    runwayRecommendation: string;

    pilotMessage: string;

    atcMessage: string;

    dispatcherMessage: string;

    airportMessage: string;

    recommendations: string[];

}

export class WindRules {

    /**
     * ============================================================
     * Main Evaluation
     * ============================================================
     */

    static evaluate(
        wx: CanonicalWeatherObservation
    ): WindAssessment {

        const crosswind =
            Math.abs(wx.crosswindComponent ?? 0);

        const headwind =
            wx.headwindComponent ?? 0;

        const tailwind =
            wx.tailwindComponent ?? 0;

        const score =
            this.calculateRiskScore(
                wx.windSpeed,
                crosswind,
                wx.windGust
            );

        const severity =
            this.determineSeverity(score);

        const operationalStatus =
            this.operationalStatus(score);

        return {

            windDirection:
                wx.windDirection,

            windSpeed:
                wx.windSpeed,

            gust:
                wx.windGust,

            crosswind,

            headwind,

            tailwind,

            severity,

            score,

            operationalStatus,

            runwayRecommendation:
                this.runwayRecommendation(wx),

            pilotMessage:
                this.pilotMessage(score),

            atcMessage:
                this.atcMessage(score),

            dispatcherMessage:
                this.dispatcherMessage(score),

            airportMessage:
                this.airportMessage(score),

            recommendations:
                this.recommendations(score)

        };

    }

    /**
     * ============================================================
     * Risk Score
     * ============================================================
     */

    static calculateRiskScore(
        windSpeed: number,
        crosswind: number,
        gust?: number
    ): number {

        let score = 0;

        // Sustained wind

        if (windSpeed >= 45)
            score += 30;

        else if (windSpeed >= 35)
            score += 22;

        else if (windSpeed >= 25)
            score += 14;

        else if (windSpeed >= 15)
            score += 6;

        // Crosswind

        if (crosswind >= 35)
            score += 35;

        else if (crosswind >= 25)
            score += 25;

        else if (crosswind >= 20)
            score += 18;

        else if (crosswind >= 15)
            score += 10;

        else if (crosswind >= 10)
            score += 5;

        // Gust spread

        if (
            gust != null &&
            gust > windSpeed
        ) {

            const spread =
                gust - windSpeed;

            if (spread >= 20)
                score += 18;

            else if (spread >= 15)
                score += 12;

            else if (spread >= 10)
                score += 6;

        }

        return AviationMath.clamp(
            score,
            0,
            100
        );

    }

    /**
     * ============================================================
     * Severity
     * ============================================================
     */

    static determineSeverity(
        score: number
    ):
        | "NONE"
        | "LOW"
        | "MODERATE"
        | "HIGH"
        | "EXTREME" {

        if (score <= 10)
            return "NONE";

        if (score <= 30)
            return "LOW";

        if (score <= 55)
            return "MODERATE";

        if (score <= 80)
            return "HIGH";

        return "EXTREME";

    }

        /**
     * ============================================================
     * Operational Status
     * ============================================================
     */

    static operationalStatus(
        score: number
    ):
        | "NORMAL"
        | "CAUTION"
        | "RESTRICTED"
        | "CRITICAL" {

        if (score <= 10)
            return "NORMAL";

        if (score <= 30)
            return "CAUTION";

        if (score <= 60)
            return "RESTRICTED";

        return "CRITICAL";

    }

    /**
     * ============================================================
     * Runway Recommendation
     * ============================================================
     */

    static runwayRecommendation(
        wx: CanonicalWeatherObservation
    ): string {

        const crosswind =
            Math.abs(wx.crosswindComponent ?? 0);

        const tailwind =
            Math.abs(wx.tailwindComponent ?? 0);

        if (crosswind > 30)
            return "Crosswind exceeds most aircraft operating limits. Consider runway change or delay.";

        if (tailwind > 10)
            return "Tailwind component is high. Prefer opposite runway if available.";

        if (crosswind > 20)
            return "Use runway with the lowest available crosswind component.";

        if (wx.headwindComponent != null && wx.headwindComponent > 5)
            return "Current runway provides a favourable headwind component.";

        return "Current runway is suitable for normal operations.";

    }

    /**
     * ============================================================
     * Pilot Guidance
     * ============================================================
     */

    static pilotMessage(
        score: number
    ): string {

        if (score <= 10)
            return "Wind conditions are favourable for normal operations.";

        if (score <= 30)
            return "Maintain awareness of changing wind conditions during approach and departure.";

        if (score <= 60)
            return "Exercise caution due to elevated wind or crosswind conditions.";

        return "Strong winds present a significant operational hazard. Delay or diversion may be necessary.";

    }

    /**
     * ============================================================
     * ATC Guidance
     * ============================================================
     */

    static atcMessage(
        score: number
    ): string {

        if (score <= 10)
            return "Normal runway operations.";

        if (score <= 30)
            return "Monitor wind changes and update runway configuration if required.";

        if (score <= 60)
            return "Expect increased spacing and runway changes.";

        return "Restrict operations to aircraft capable of operating in current wind conditions.";

    }

    /**
     * ============================================================
     * Dispatcher Guidance
     * ============================================================
     */

    static dispatcherMessage(
        score: number
    ): string {

        if (score <= 10)
            return "No wind-related operational restrictions.";

        if (score <= 30)
            return "Review destination weather trends before dispatch.";

        if (score <= 60)
            return "Consider additional fuel and alternate airport planning.";

        return "Recommend delaying dispatch until wind conditions improve.";

    }

    /**
 * ============================================================
 * Airport Operations Guidance
 * ============================================================
 */

static airportMessage(
    score: number
): string {

    if (score <= 10)
        return "Wind conditions are within normal airport operational limits.";

    if (score <= 30)
        return "Monitor wind conditions and advise airside personnel.";

    if (score <= 60)
        return "Review runway configuration and secure ground equipment.";

    return "Restrict apron operations until wind conditions improve.";

}

    /**
     * ============================================================
     * Operational Recommendations
     * ============================================================
     */

    static recommendations(
        score: number
    ): string[] {

        if (score <= 10) {

            return [
                "Normal operations.",
                "Continue routine wind monitoring."
            ];

        }

        if (score <= 30) {

            return [
                "Monitor wind trend.",
                "Brief flight crew on possible runway changes.",
                "Review crosswind limits."
            ];

        }

        if (score <= 60) {

            return [
                "Consider alternate runway.",
                "Review aircraft crosswind limitations.",
                "Increase ATC separation if necessary.",
                "Prepare alternate aerodrome."
            ];

        }

        return [

            "Delay departures where possible.",
            "Expect diversions.",
            "Restrict light aircraft operations.",
            "Review emergency procedures.",
            "Continuously monitor wind observations."

        ];

    }

        /**
     * ============================================================
     * Wind Shear
     * ============================================================
     */

    static hasWindShear(
        wx: CanonicalWeatherObservation
    ): boolean {

        return wx.lowLevelWindShear === true;

    }

    /**
     * ============================================================
     * Gust Hazard
     * ============================================================
     */

    static hasDangerousGusts(
        wx: CanonicalWeatherObservation
    ): boolean {

        if (wx.windGust == null)
            return false;

        return (wx.windGust - wx.windSpeed) >= 15;

    }

    /**
     * ============================================================
     * Crosswind Limit Check
     * ============================================================
     */

    static exceedsCrosswindLimit(
        wx: CanonicalWeatherObservation,
        limit: number
    ): boolean {

        return Math.abs(
            wx.crosswindComponent ?? 0
        ) > limit;

    }

    /**
     * ============================================================
     * Tailwind Limit Check
     * ============================================================
     */

    static exceedsTailwindLimit(
        wx: CanonicalWeatherObservation,
        limit: number = 10
    ): boolean {

        return (wx.tailwindComponent ?? 0) > limit;

    }

    /**
     * ============================================================
     * Strong Headwind
     * ============================================================
     */

    static hasStrongHeadwind(
        wx: CanonicalWeatherObservation
    ): boolean {

        return (wx.headwindComponent ?? 0) >= 20;

    }

    /**
     * ============================================================
     * Light Aircraft Suitability
     * ============================================================
     */

    static suitableForLightAircraft(
        wx: CanonicalWeatherObservation
    ): boolean {

        return (
            wx.windSpeed <= 20 &&
            Math.abs(wx.crosswindComponent ?? 0) <= 10 &&
            !this.hasWindShear(wx)
        );

    }

    /**
     * ============================================================
     * Commercial Aircraft Suitability
     * ============================================================
     */

    static suitableForCommercialAircraft(
        wx: CanonicalWeatherObservation
    ): boolean {

        return (
            wx.windSpeed <= 40 &&
            Math.abs(wx.crosswindComponent ?? 0) <= 25 &&
            (wx.tailwindComponent ?? 0) <= 10 &&
            !this.hasWindShear(wx)
        );

    }

    /**
     * ============================================================
     * General Aviation Suitability
     * ============================================================
     */

    static suitableForGeneralAviation(
        wx: CanonicalWeatherObservation
    ): boolean {

        return (
            wx.windSpeed <= 25 &&
            Math.abs(wx.crosswindComponent ?? 0) <= 15 &&
            (wx.tailwindComponent ?? 0) <= 5
        );

    }

    /**
     * ============================================================
     * Runway Suitability
     * ============================================================
     */

    static runwaySuitable(
        wx: CanonicalWeatherObservation
    ): boolean {

        return (
            !this.exceedsCrosswindLimit(wx, 25) &&
            !this.exceedsTailwindLimit(wx, 10)
        );

    }

    /**
     * ============================================================
     * Wind Trend
     * ============================================================
     */

    static trend(
        previousWind: number,
        currentWind: number
    ):
        | "INCREASING"
        | "STEADY"
        | "DECREASING" {

        const difference =
            currentWind - previousWind;

        if (difference >= 5)
            return "INCREASING";

        if (difference <= -5)
            return "DECREASING";

        return "STEADY";

    }

    /**
     * ============================================================
     * Wind Direction Change
     * ============================================================
     */

    static directionChangedSignificantly(
        previousDirection: number,
        currentDirection: number
    ): boolean {

        let diff =
            Math.abs(
                currentDirection - previousDirection
            );

        if (diff > 180)
            diff = 360 - diff;

        return diff >= 30;

    }

    /**
     * ============================================================
     * Operational Summary
     * ============================================================
     */

    static summary(
        wx: CanonicalWeatherObservation
    ): string {

        const assessment =
            this.evaluate(wx);

        return `Wind ${assessment.windDirection}° at ${assessment.windSpeed} kt with ${assessment.crosswind.toFixed(1)} kt crosswind. Operational status: ${assessment.operationalStatus}.`;

    }

}