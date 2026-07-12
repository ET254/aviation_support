import {
    CanonicalWeatherObservation,
    FlightCategory
} from "../../../models/weather/CanonicalWeatherObservation";

export interface VisibilityAssessment {

    visibility: number;

    category: FlightCategory;

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

    colour: string;

    pilotMessage: string;

    atcMessage: string;

    dispatcherMessage: string;

    airportMessage: string;

    recommendations: string[];

}

export class VisibilityRules {

    /**
     * ============================================================
     * Main Evaluation
     * ============================================================
     */

    static evaluate(
        wx: CanonicalWeatherObservation
    ): VisibilityAssessment {

        const visibility =
            wx.visibility ?? 99999;

        const category =
            this.determineFlightCategory(visibility);

        const severity =
            this.determineSeverity(visibility);

        const score =
            this.calculateRiskScore(visibility);

        const operationalStatus =
            this.operationalStatus(score);

        return {

            visibility,

            category,

            severity,

            score,

            operationalStatus,

            colour:
                this.colour(score),

            pilotMessage:
                this.pilotMessage(category),

            atcMessage:
                this.atcMessage(category),

            dispatcherMessage:
                this.dispatcherMessage(category),

            airportMessage:
                this.airportMessage(category),

            recommendations:
                this.recommendations(category)

        };

    }

    /**
     * ============================================================
     * ICAO Flight Category
     * ============================================================
     */

    static determineFlightCategory(
        visibility: number
    ): FlightCategory {

        if (visibility >= 8000)
            return "VFR";

        if (visibility >= 5000)
            return "MVFR";

        if (visibility >= 1600)
            return "IFR";

        return "LIFR";

    }

    /**
     * ============================================================
     * Operational Severity
     * ============================================================
     */

    static determineSeverity(
        visibility: number
    ):
        | "NONE"
        | "LOW"
        | "MODERATE"
        | "HIGH"
        | "EXTREME" {

        if (visibility >= 10000)
            return "NONE";

        if (visibility >= 8000)
            return "LOW";

        if (visibility >= 5000)
            return "MODERATE";

        if (visibility >= 1600)
            return "HIGH";

        return "EXTREME";

    }

    /**
     * ============================================================
     * Numerical Risk
     * ============================================================
     */

    static calculateRiskScore(
        visibility: number
    ): number {

        if (visibility >= 10000)
            return 0;

        if (visibility >= 8000)
            return 10;

        if (visibility >= 5000)
            return 25;

        if (visibility >= 3000)
            return 40;

        if (visibility >= 1600)
            return 60;

        if (visibility >= 800)
            return 80;

        return 100;

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

        if (score <= 35)
            return "CAUTION";

        if (score <= 70)
            return "RESTRICTED";

        return "CRITICAL";

    }

    /**
     * ============================================================
     * Dashboard Colour
     * ============================================================
     */

    static colour(
        score: number
    ): string {

        if (score <= 10)
            return "#22c55e";

        if (score <= 35)
            return "#eab308";

        if (score <= 70)
            return "#f97316";

        return "#dc2626";

    }

    /**
     * ============================================================
     * Pilot Guidance
     * ============================================================
     */

    static pilotMessage(
        category: FlightCategory
    ): string {

        switch (category) {

            case "VFR":
                return "Excellent visibility. Normal VFR operations.";

            case "MVFR":
                return "Marginal visual conditions. Increased vigilance advised.";

            case "IFR":
                return "Instrument Flight Rules required. Expect approach limitations.";

            case "LIFR":
                return "Extremely poor visibility. Instrument approach only. Diversion may be required.";

        }

    }

    /**
     * ============================================================
     * ATC Guidance
     * ============================================================
     */

    static atcMessage(
        category: FlightCategory
    ): string {

        switch (category) {

            case "VFR":
                return "Normal aerodrome operations.";

            case "MVFR":
                return "Increase spacing and monitor deteriorating conditions.";

            case "IFR":
                return "Apply IFR separation standards and expect arrival delays.";

            case "LIFR":
                return "Restrict traffic flow. Low visibility procedures should be active.";

        }

    }

    /**
     * ============================================================
     * Dispatcher Guidance
     * ============================================================
     */

    static dispatcherMessage(
        category: FlightCategory
    ): string {

        switch (category) {

            case "VFR":
                return "No operational restrictions expected.";

            case "MVFR":
                return "Review destination alternates and fuel planning.";

            case "IFR":
                return "Dispatch under IFR. Alternate aerodrome likely required.";

            case "LIFR":
                return "High diversion risk. Delay or reroute operations if necessary.";

        }

    }

    /**
 * ============================================================
 * Airport Operations Guidance
 * ============================================================
 */

static airportMessage(
    category: FlightCategory
): string {

    switch (category) {

        case "VFR":
            return "Airport visibility is within normal operating limits.";

        case "MVFR":
            return "Monitor visibility and prepare for possible operational restrictions.";

        case "IFR":
            return "Prepare Low Visibility Procedures and coordinate airport operations.";

        case "LIFR":
            return "Activate Low Visibility Procedures and restrict visibility-dependent operations.";

    }

}

        /**
     * ============================================================
     * Operational Recommendations
     * ============================================================
     */

    static recommendations(
        category: FlightCategory
    ): string[] {

        switch (category) {

            case "VFR":

                return [
                    "Normal visual operations permitted.",
                    "Maintain routine monitoring of visibility.",
                    "No visibility-related operational restrictions."
                ];

            case "MVFR":

                return [
                    "Exercise additional caution during approach and departure.",
                    "Review alternate aerodromes.",
                    "Increase flight crew situational awareness.",
                    "Monitor visibility trend closely."
                ];

            case "IFR":

                return [
                    "Operate under Instrument Flight Rules.",
                    "Ensure instrument approach procedures are available.",
                    "Review alternate airport requirements.",
                    "Expect possible delays and increased ATC separation."
                ];

            case "LIFR":

                return [
                    "Activate Low Visibility Procedures (LVP).",
                    "Only suitably equipped aircraft should operate.",
                    "Consider delaying departures.",
                    "Expect holding or diversion.",
                    "Monitor runway visual range continuously."
                ];

        }

    }

    /**
     * ============================================================
     * Low Visibility
     * ============================================================
     */

    static isLowVisibility(
        wx: CanonicalWeatherObservation
    ): boolean {

        return wx.visibility < 5000;

    }

    /**
     * ============================================================
     * Very Low Visibility
     * ============================================================
     */

    static isVeryLowVisibility(
        wx: CanonicalWeatherObservation
    ): boolean {

        return wx.visibility < 1600;

    }

    /**
     * ============================================================
     * CAT I Landing Minimum
     * ============================================================
     */

    static isBelowCATI(
        wx: CanonicalWeatherObservation
    ): boolean {

        return wx.visibility < 550;

    }

    /**
     * ============================================================
     * CAT II Landing Minimum
     * ============================================================
     */

    static isBelowCATII(
        wx: CanonicalWeatherObservation
    ): boolean {

        return wx.visibility < 300;

    }

    /**
     * ============================================================
     * CAT III Landing Minimum
     * ============================================================
     */

    static isBelowCATIII(
        wx: CanonicalWeatherObservation
    ): boolean {

        return wx.visibility < 75;

    }

    /**
     * ============================================================
     * Low Visibility Procedures Required
     * ============================================================
     */

    static requiresLVP(
        wx: CanonicalWeatherObservation
    ): boolean {

        return wx.visibility < 800;

    }

    /**
     * ============================================================
     * VFR Allowed
     * ============================================================
     */

    static canOperateVFR(
        wx: CanonicalWeatherObservation
    ): boolean {

        return wx.visibility >= 5000;

    }

    /**
     * ============================================================
     * IFR Allowed
     * ============================================================
     */

    static canOperateIFR(
        wx: CanonicalWeatherObservation
    ): boolean {

        return wx.visibility >= 550;

    }

    /**
     * ============================================================
     * Airport Closed due to Visibility
     * ============================================================
     */

    static isAirportClosedByVisibility(
        wx: CanonicalWeatherObservation
    ): boolean {

        return wx.visibility < 75;

    }

    /**
     * ============================================================
     * Visibility Trend
     * ============================================================
     */

    static trend(
        previousVisibility: number,
        currentVisibility: number
    ):
        | "IMPROVING"
        | "STEADY"
        | "DETERIORATING" {

        const difference =
            currentVisibility - previousVisibility;

        if (difference > 500)
            return "IMPROVING";

        if (difference < -500)
            return "DETERIORATING";

        return "STEADY";

    }

    /**
     * ============================================================
     * Human-readable Summary
     * ============================================================
     */

    static summary(
        wx: CanonicalWeatherObservation
    ): string {

        const assessment =
            this.evaluate(wx);

        return `${assessment.category} conditions with ${assessment.visibility} m visibility. Operational status: ${assessment.operationalStatus}.`;

    }

}