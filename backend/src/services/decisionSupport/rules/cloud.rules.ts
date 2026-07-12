import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";

export interface CloudAssessment {

    ceiling?: number;

    cloudBase?: number;

    cloudAmount?: number;

    cloudType?: string;

    flightCategory:
        | "VFR"
        | "MVFR"
        | "IFR"
        | "LIFR";

    score: number;

    severity:
        | "NONE"
        | "LOW"
        | "MODERATE"
        | "HIGH"
        | "EXTREME";

    operationalStatus:
        | "NORMAL"
        | "CAUTION"
        | "RESTRICTED"
        | "CRITICAL";

    pilotMessage: string;

    atcMessage: string;

    dispatcherMessage: string;

    airportMessage: string;

    recommendations: string[];

}

export class CloudRules {

    /**
     * ============================================================
     * Main Evaluation
     * ============================================================
     */

    static evaluate(
        wx: CanonicalWeatherObservation
    ): CloudAssessment {

        const score =
            this.calculateRiskScore(wx);

        return {

            ceiling:
                wx.ceiling,

            cloudBase:
                wx.cloudBase,

            cloudAmount:
                wx.cloudAmount,

            cloudType:
                wx.cloudType,

            flightCategory:
                this.flightCategory(wx),

            score,

            severity:
                this.determineSeverity(score),

            operationalStatus:
                this.operationalStatus(score),

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
     * Cloud Risk Score
     * ============================================================
     */

    static calculateRiskScore(
        wx: CanonicalWeatherObservation
    ): number {

        let score = 0;

        const ceiling =
            wx.ceiling ??
            wx.cloudBase;

        if (ceiling != null) {

            if (ceiling < 200)
                score += 40;

            else if (ceiling < 500)
                score += 30;

            else if (ceiling < 1000)
                score += 20;

            else if (ceiling < 3000)
                score += 10;

        }

        if (wx.cloudAmount != null) {

            if (wx.cloudAmount >= 8)
                score += 10;

            else if (wx.cloudAmount >= 6)
                score += 6;

            else if (wx.cloudAmount >= 4)
                score += 3;

        }

        if (wx.cumulonimbus)
            score += 25;

        if (wx.toweringCumulus)
            score += 15;

        return Math.min(score, 100);

    }

    /**
     * ============================================================
     * Flight Category
     * ICAO / FAA Standard
     * ============================================================
     */

    static flightCategory(
        wx: CanonicalWeatherObservation
    ):
        | "VFR"
        | "MVFR"
        | "IFR"
        | "LIFR" {

        const ceiling =
            wx.ceiling ??
            wx.cloudBase ??
            99999;

        const visibility =
            wx.visibility;

        if (
            ceiling < 500 ||
            visibility < 1600
        )
            return "LIFR";

        if (
            ceiling < 1000 ||
            visibility < 4800
        )
            return "IFR";

        if (
            ceiling < 3000 ||
            visibility < 8000
        )
            return "MVFR";

        return "VFR";

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
     * Pilot Guidance
     * ============================================================
     */

    static pilotMessage(
        score: number
    ): string {

        if (score <= 10)
            return "Cloud conditions suitable for normal visual flight.";

        if (score <= 30)
            return "Maintain awareness of lowering cloud bases and monitor changing conditions.";

        if (score <= 60)
            return "IFR operations may be required. Review approach minima before departure.";

        return "Very low ceilings or hazardous convective clouds. Consider delaying or diverting the flight.";

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
            return "Normal traffic flow expected.";

        if (score <= 30)
            return "Monitor ceiling changes and advise pilots accordingly.";

        if (score <= 60)
            return "Expect increased IFR traffic and possible spacing delays.";

        return "Implement IFR procedures and consider flow restrictions where necessary.";

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
            return "No cloud-related operational restrictions.";

        if (score <= 30)
            return "Review destination cloud forecasts and alternate requirements.";

        if (score <= 60)
            return "Evaluate alternate airports and additional contingency fuel.";

        return "Recommend delaying dispatch or selecting an alternate destination.";

    }

    /**
 * Airport Operations Guidance
 */

static airportMessage(
    score: number
): string {

    if (score <= 10)
        return "Cloud conditions support normal airport operations.";

    if (score <= 30)
        return "Monitor cloud ceiling trends.";

    if (score <= 60)
        return "Coordinate with ATC for reduced ceiling procedures.";

    return "Restrict operations requiring visual conditions.";

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

                "Continue normal VFR operations.",
                "Maintain routine weather monitoring."

            ];

        }

        if (score <= 30) {

            return [

                "Monitor cloud ceiling trends.",
                "Prepare for possible transition to IFR.",
                "Brief pilots on changing weather conditions."

            ];

        }

        if (score <= 60) {

            return [

                "Operate under IFR where appropriate.",
                "Review instrument approach procedures.",
                "Increase ATC separation if required.",
                "Monitor convective cloud development."

            ];

        }

        return [

            "Suspend VFR operations.",
            "Use instrument approaches only.",
            "Consider delaying departures.",
            "Prepare diversion plans.",
            "Continuously monitor convective weather."

        ];

    }

        /**
     * ============================================================
     * Ceiling Evaluation
     * ============================================================
     */

    static hasLowCeiling(
        wx: CanonicalWeatherObservation
    ): boolean {

        const ceiling =
            wx.ceiling ??
            wx.cloudBase;

        return (
            ceiling != null &&
            ceiling < 1000
        );

    }

    /**
     * ============================================================
     * Broken / Overcast Ceiling
     * ============================================================
     */

    static hasCeiling(
        wx: CanonicalWeatherObservation
    ): boolean {

        if (wx.cloudLayers) {

            return wx.cloudLayers.some(layer =>
                (layer.amount === "BKN" || layer.amount === "OVC") &&
                layer.base <= 5000
            );

        }

        return (
            (wx.cloudAmount ?? 0) >= 5
        );

    }

    /**
     * ============================================================
     * Cumulonimbus Detection
     * ============================================================
     */

    static hasCumulonimbus(
        wx: CanonicalWeatherObservation
    ): boolean {

        if (wx.cumulonimbus)
            return true;

        if (!wx.cloudLayers)
            return false;

        return wx.cloudLayers.some(layer =>
            layer.type === "CB"
        );

    }

    /**
     * ============================================================
     * Towering Cumulus Detection
     * ============================================================
     */

    static hasToweringCumulus(
        wx: CanonicalWeatherObservation
    ): boolean {

        if (wx.toweringCumulus)
            return true;

        if (!wx.cloudLayers)
            return false;

        return wx.cloudLayers.some(layer =>
            layer.type === "TCU"
        );

    }

    /**
     * ============================================================
     * Convective Cloud Hazard
     * ============================================================
     */

    static hasConvectiveClouds(
        wx: CanonicalWeatherObservation
    ): boolean {

        return (
            wx.convectiveClouds === true ||
            this.hasCumulonimbus(wx) ||
            this.hasToweringCumulus(wx)
        );

    }

    /**
     * ============================================================
     * Suitable For VFR
     * ============================================================
     */

    static suitableForVFR(
        wx: CanonicalWeatherObservation
    ): boolean {

        return (
            this.flightCategory(wx) === "VFR"
        );

    }

    /**
     * ============================================================
     * Suitable For IFR
     * ============================================================
     */

    static suitableForIFR(
        wx: CanonicalWeatherObservation
    ): boolean {

        return (
            this.flightCategory(wx) !== "LIFR"
        );

    }

    /**
     * ============================================================
     * Commercial Operations
     * ============================================================
     */

    static suitableForCommercialOperations(
        wx: CanonicalWeatherObservation
    ): boolean {

        return (
            !this.hasCumulonimbus(wx) &&
            this.flightCategory(wx) !== "LIFR"
        );

    }

    /**
     * ============================================================
     * General Aviation
     * ============================================================
     */

    static suitableForGeneralAviation(
        wx: CanonicalWeatherObservation
    ): boolean {

        return (
            this.flightCategory(wx) === "VFR" &&
            !this.hasConvectiveClouds(wx)
        );

    }

    /**
     * ============================================================
     * Human Readable Summary
     * ============================================================
     */

    static summary(
        wx: CanonicalWeatherObservation
    ): string {

        const assessment =
            this.evaluate(wx);

        const hazards: string[] = [];

        if (this.hasLowCeiling(wx))
            hazards.push("Low ceiling");

        if (this.hasCumulonimbus(wx))
            hazards.push("Cumulonimbus");

        if (this.hasToweringCumulus(wx))
            hazards.push("Towering Cumulus");

        if (hazards.length === 0)
            hazards.push("No significant cloud hazards");

        return `Flight Category: ${assessment.flightCategory}. Ceiling: ${assessment.ceiling ?? "Unknown"} ft. Operational Status: ${assessment.operationalStatus}. Hazards: ${hazards.join(", ")}.`;

    }

}