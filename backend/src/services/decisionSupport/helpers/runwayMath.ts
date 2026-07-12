/**
 * ============================================================================
 * Kenya Aviation Weather Decision Support System
 * Runway Mathematics Helper Library
 * ----------------------------------------------------------------------------
 * ICAO / FAA / EASA runway operational calculations.
 *
 * Responsibilities:
 * - Runway heading calculations
 * - Reciprocal runway calculations
 * - Crosswind / headwind / tailwind calculations
 * - Best runway selection
 * - Runway usability scoring
 * ============================================================================
 */

import { AviationMath } from "./aviationMath";

export interface RunwayInfo {
    designation: string;       // Example: "07/25"
    heading: number;           // Primary runway heading
    reciprocalHeading: number; // Opposite runway heading
    length: number;            // Feet
    surface: string;
}

export interface RunwayWindComponents {
    runway: string;
    heading: number;
    crosswind: number;
    headwind: number;
    tailwind: number;
    windAngle: number;
}

export class RunwayMath {

    /**
     * Convert runway designation to heading.
     *
     * Example:
     * 07 -> 70°
     * 25 -> 250°
     * 36 -> 360°
     */
    static runwayNumberToHeading(runway: number): number {

        if (runway === 36) return 360;

        return runway * 10;
    }

    /**
     * Heading → reciprocal heading.
     *
     * Example:
     * 70 -> 250
     */
    static reciprocalHeading(heading: number): number {

        return AviationMath.normalizeHeading(
            heading + 180
        );
    }

    /**
     * Parse runway orientation.
     *
     * Example:
     *
     * "07/25"
     *
     * Returns:
     *
     * [70,250]
     */
    static parseOrientation(
        orientation: string
    ): number[] {

        return orientation
            .split("/")
            .map(value =>
                this.runwayNumberToHeading(
                    parseInt(value, 10)
                )
            );
    }

    /**
     * Calculate wind components for a runway.
     */
    static calculateComponents(

        runwayHeading: number,
        windDirection: number,
        windSpeed: number

    ): RunwayWindComponents {

        const crosswind =
            AviationMath.calculateCrosswind(
                windDirection,
                windSpeed,
                runwayHeading
            );

        const headwind =
            AviationMath.calculateHeadwind(
                windDirection,
                windSpeed,
                runwayHeading
            );

        const tailwind =
            AviationMath.calculateTailwind(
                windDirection,
                windSpeed,
                runwayHeading
            );

        return {

            runway: "",

            heading: runwayHeading,

            crosswind,

            headwind,

            tailwind,

            windAngle:
                AviationMath.angleDifference(
                    windDirection,
                    runwayHeading
                )

        };
    }

    /**
     * Evaluate runway usability.
     *
     * Score:
     *
     * 100 = Excellent
     * 0   = Unsafe
     */
    static runwayScore(

        crosswind: number,
        tailwind: number

    ): number {

        let score = 100;

        score -= Math.abs(crosswind) * 2.5;

        score -= tailwind * 5;

        return AviationMath.clamp(
            score,
            0,
            100
        );
    }

    /**
     * Determine runway status.
     */
    static runwayStatus(

        crosswind: number,
        tailwind: number

    ): string {

        const cw = Math.abs(crosswind);

        if (tailwind > 10)
            return "UNSAFE";

        if (cw > 35)
            return "UNSAFE";

        if (cw > 25)
            return "HIGH RISK";

        if (cw > 15)
            return "CAUTION";

        return "NORMAL";
    }

    /**
     * Select the best runway.
     */
    static selectBestRunway(

        orientation: string,

        windDirection: number,

        windSpeed: number

    ): RunwayWindComponents {

        const headings =
            this.parseOrientation(
                orientation
            );

        const first =
            this.calculateComponents(
                headings[0],
                windDirection,
                windSpeed
            );

        first.runway =
            orientation.split("/")[0];

        const second =
            this.calculateComponents(
                headings[1],
                windDirection,
                windSpeed
            );

        second.runway =
            orientation.split("/")[1];

        const firstScore =
            this.runwayScore(
                first.crosswind,
                first.tailwind
            );

        const secondScore =
            this.runwayScore(
                second.crosswind,
                second.tailwind
            );

        return firstScore >= secondScore
            ? first
            : second;
    }

    /**
     * Determine if runway is operational.
     */
    static isOperational(

        crosswind: number,

        tailwind: number,

        maxCrosswind = 25,

        maxTailwind = 10

    ): boolean {

        return (

            Math.abs(crosswind) <= maxCrosswind &&

            tailwind <= maxTailwind

        );
    }

    /**
     * Estimate landing distance correction.
     *
     * Positive = Increase required landing distance.
     */
    static landingDistanceCorrection(

        tailwind: number,

        runwayWet: boolean

    ): number {

        let correction = 0;

        correction += tailwind * 5;

        if (runwayWet)
            correction += 15;

        return correction;
    }

    /**
     * Estimate takeoff distance correction.
     */
    static takeoffDistanceCorrection(

        tailwind: number,

        densityAltitude: number

    ): number {

        let correction = 0;

        correction += tailwind * 4;

        correction += densityAltitude / 1000;

        return correction;
    }

}