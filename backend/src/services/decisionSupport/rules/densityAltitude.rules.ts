import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";

export interface DensityAltitudeAssessment {

    densityAltitude: number;

    pressureAltitude?: number;

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

    aircraftPerformanceReduction: number;

    takeoffPerformanceReduction: number;

    climbPerformanceReduction: number;

    landingPerformanceIncrease: number;

    pilotMessage: string;

    atcMessage: string;

    dispatcherMessage: string;

    airportMessage: string;

    recommendations: string[];

}

export class DensityAltitudeRules {

    /**
     * ============================================================
     * Main Evaluation
     * ============================================================
     */

    static evaluate(
        wx: CanonicalWeatherObservation
    ): DensityAltitudeAssessment {

        const densityAltitude =
            wx.densityAltitude ?? 0;

        const score =
            this.calculateRiskScore(
                densityAltitude
            );

        return {

            densityAltitude,

            pressureAltitude:
                wx.pressureAltitude,

            severity:
                this.determineSeverity(score),

            score,

            operationalStatus:
                this.operationalStatus(score),

            aircraftPerformanceReduction:
                this.aircraftPerformanceReduction(
                    densityAltitude
                ),

            takeoffPerformanceReduction:
                this.takeoffPerformanceReduction(
                    densityAltitude
                ),

            climbPerformanceReduction:
                this.climbPerformanceReduction(
                    densityAltitude
                ),

            landingPerformanceIncrease:
                this.landingPerformanceIncrease(
                    densityAltitude
                ),

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
        densityAltitude: number
    ): number {

        if (densityAltitude < 3000)
            return 0;

        if (densityAltitude < 5000)
            return 10;

        if (densityAltitude < 7000)
            return 25;

        if (densityAltitude < 9000)
            return 45;

        if (densityAltitude < 11000)
            return 65;

        return 90;

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

        if (score === 0)
            return "NONE";

        if (score <= 20)
            return "LOW";

        if (score <= 45)
            return "MODERATE";

        if (score <= 70)
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

        if (score === 0)
            return "NORMAL";

        if (score <= 20)
            return "CAUTION";

        if (score <= 50)
            return "RESTRICTED";

        return "CRITICAL";

    }

    /**
     * ============================================================
     * Aircraft Performance Reduction (%)
     * ============================================================
     */

    static aircraftPerformanceReduction(
        densityAltitude: number
    ): number {

        if (densityAltitude < 3000)
            return 0;

        if (densityAltitude < 5000)
            return 5;

        if (densityAltitude < 7000)
            return 10;

        if (densityAltitude < 9000)
            return 15;

        if (densityAltitude < 11000)
            return 20;

        return 30;

    }

    /**
     * ============================================================
     * Takeoff Performance Reduction (%)
     * ============================================================
     */

    static takeoffPerformanceReduction(
        densityAltitude: number
    ): number {

        if (densityAltitude < 3000)
            return 0;

        if (densityAltitude < 5000)
            return 8;

        if (densityAltitude < 7000)
            return 15;

        if (densityAltitude < 9000)
            return 22;

        if (densityAltitude < 11000)
            return 30;

        return 40;

    }

    /**
     * ============================================================
     * Climb Performance Reduction (%)
     * ============================================================
     */

    static climbPerformanceReduction(
        densityAltitude: number
    ): number {

        if (densityAltitude < 3000)
            return 0;

        if (densityAltitude < 5000)
            return 8;

        if (densityAltitude < 7000)
            return 15;

        if (densityAltitude < 9000)
            return 25;

        if (densityAltitude < 11000)
            return 35;

        return 50;

    }

    /**
     * ============================================================
     * Landing Distance Increase (%)
     * ============================================================
     */

    static landingPerformanceIncrease(
        densityAltitude: number
    ): number {

        if (densityAltitude < 3000)
            return 0;

        if (densityAltitude < 5000)
            return 5;

        if (densityAltitude < 7000)
            return 10;

        if (densityAltitude < 9000)
            return 15;

        if (densityAltitude < 11000)
            return 20;

        return 30;

    }

    /**
     * ============================================================
     * Pilot Guidance
     * ============================================================
     */

    static pilotMessage(
        score: number
    ): string {

        if (score === 0)
            return "Density altitude has minimal effect on aircraft performance.";

        if (score <= 20)
            return "Monitor aircraft weight and performance calculations before departure.";

        if (score <= 50)
            return "Expect reduced climb performance and longer takeoff distances. Review performance charts carefully.";

        return "Extreme density altitude. Consider delaying operations, reducing aircraft weight or selecting an alternate airport.";

    }

    /**
     * ============================================================
     * Air Traffic Control Guidance
     * ============================================================
     */

    static atcMessage(
        score: number
    ): string {

        if (score === 0)
            return "No density altitude operational concerns.";

        if (score <= 20)
            return "Monitor departures for reduced climb performance.";

        if (score <= 50)
            return "Increase departure spacing where appropriate and anticipate slower climb rates.";

        return "Coordinate extended departures, reduced payload operations and possible delays due to degraded aircraft performance.";

    }

    /**
     * ============================================================
     * Dispatcher Guidance
     * ============================================================
     */

    static dispatcherMessage(
        score: number
    ): string {

        if (score === 0)
            return "No dispatch limitations related to density altitude.";

        if (score <= 20)
            return "Review aircraft performance data before flight release.";

        if (score <= 50)
            return "Evaluate payload restrictions, runway length and obstacle clearance requirements.";

        return "Reduce payload where necessary, consider cooler departure times and evaluate alternate airports.";

    }

    /**
 * Airport Operations Guidance
 */

static airportMessage(
    score: number
): string {

    if (score === 0)
        return "Density altitude is within normal operational limits.";

    if (score <= 20)
        return "Monitor aircraft performance during departures.";

    if (score <= 50)
        return "Coordinate payload restrictions and runway performance planning.";

    return "Restrict heavy aircraft departures and consider delaying operations during peak temperatures.";

}

    /**
     * ============================================================
     * Operational Recommendations
     * ============================================================
     */

    static recommendations(
        score: number
    ): string[] {

        if (score === 0) {

            return [

                "Continue normal flight operations.",
                "Apply standard aircraft performance calculations."

            ];

        }

        if (score <= 20) {

            return [

                "Verify takeoff performance.",
                "Review aircraft weight and balance.",
                "Monitor temperature changes."

            ];

        }

        if (score <= 50) {

            return [

                "Reduce aircraft weight if necessary.",
                "Carry only essential fuel within safety limits.",
                "Review obstacle clearance procedures.",
                "Use maximum available runway.",
                "Consider cooler departure periods."

            ];

        }

        return [

            "Strongly consider delaying departure until temperatures decrease.",
            "Reduce payload significantly.",
            "Use full runway length.",
            "Expect degraded climb performance.",
            "Review emergency engine-out procedures.",
            "Consider alternate airports with lower elevation.",
            "Closely monitor aircraft engine performance."

        ];

    }

        /**
     * ============================================================
     * High Elevation Airport
     * ============================================================
     */

    static isHighElevationAirport(
        wx: CanonicalWeatherObservation
    ): boolean {

        return (wx.elevation ?? 0) >= 5000;

    }

    /**
     * ============================================================
     * Hot and High Conditions
     * ============================================================
     */

    static isHotAndHigh(
        wx: CanonicalWeatherObservation
    ): boolean {

        return (

            (wx.temperature >= 30) &&

            ((wx.elevation ?? 0) >= 3000)

        );

    }

    /**
     * ============================================================
     * Obstacle Clearance Risk
     * ============================================================
     */

    static obstacleClearanceRisk(
        wx: CanonicalWeatherObservation
    ):
        | "LOW"
        | "MODERATE"
        | "HIGH"
        | "EXTREME" {

        const da = wx.densityAltitude ?? 0;

        if (da < 5000)
            return "LOW";

        if (da < 8000)
            return "MODERATE";

        if (da < 10000)
            return "HIGH";

        return "EXTREME";

    }

    /**
     * ============================================================
     * Engine Performance
     * ============================================================
     */

    static enginePerformanceReduction(
        densityAltitude: number
    ): number {

        if (densityAltitude < 3000)
            return 0;

        if (densityAltitude < 5000)
            return 5;

        if (densityAltitude < 7000)
            return 10;

        if (densityAltitude < 9000)
            return 18;

        if (densityAltitude < 11000)
            return 25;

        return 35;

    }

    /**
     * ============================================================
     * Commercial Operations
     * ============================================================
     */

    static suitableForCommercialOperations(
        wx: CanonicalWeatherObservation
    ): boolean {

        const severity =
            this.determineSeverity(
                this.calculateRiskScore(
                    wx.densityAltitude ?? 0
                )
            );

        return severity !== "EXTREME";

    }

    /**
     * ============================================================
     * General Aviation Operations
     * ============================================================
     */

    static suitableForGeneralAviation(
        wx: CanonicalWeatherObservation
    ): boolean {

        const severity =
            this.determineSeverity(
                this.calculateRiskScore(
                    wx.densityAltitude ?? 0
                )
            );

        return (

            severity === "NONE" ||

            severity === "LOW"

        );

    }

    /**
     * ============================================================
     * Human Readable Operational Summary
     * ============================================================
     */

    static summary(
        wx: CanonicalWeatherObservation
    ): string {

        const assessment =
            this.evaluate(wx);

        const notes: string[] = [];

        if (this.isHighElevationAirport(wx))
            notes.push("High Elevation Airport");

        if (this.isHotAndHigh(wx))
            notes.push("Hot-and-High Conditions");

        if (
            this.obstacleClearanceRisk(wx) === "HIGH" ||
            this.obstacleClearanceRisk(wx) === "EXTREME"
        ) {

            notes.push("Obstacle Clearance Risk");

        }

        if (assessment.aircraftPerformanceReduction > 0)
            notes.push(
                `Aircraft Performance Reduction ${assessment.aircraftPerformanceReduction}%`
            );

        if (assessment.takeoffPerformanceReduction > 0)
            notes.push(
                `Takeoff Performance Reduction ${assessment.takeoffPerformanceReduction}%`
            );

        if (assessment.climbPerformanceReduction > 0)
            notes.push(
                `Climb Performance Reduction ${assessment.climbPerformanceReduction}%`
            );

        if (assessment.landingPerformanceIncrease > 0)
            notes.push(
                `Landing Distance Increase ${assessment.landingPerformanceIncrease}%`
            );

        if (notes.length === 0)
            notes.push("No significant density altitude concerns");

        return `Density Altitude Severity: ${assessment.severity}. Operational Status: ${assessment.operationalStatus}. ${notes.join(", ")}.`;

    }

}