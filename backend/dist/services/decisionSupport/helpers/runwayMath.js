"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunwayMath = void 0;
const aviationMath_1 = require("./aviationMath");
class RunwayMath {
    static runwayNumberToHeading(runway) {
        if (runway === 36)
            return 360;
        return runway * 10;
    }
    static reciprocalHeading(heading) {
        return aviationMath_1.AviationMath.normalizeHeading(heading + 180);
    }
    static parseOrientation(orientation) {
        return orientation
            .split("/")
            .map(value => this.runwayNumberToHeading(parseInt(value, 10)));
    }
    static calculateComponents(runwayHeading, windDirection, windSpeed) {
        const crosswind = aviationMath_1.AviationMath.calculateCrosswind(windDirection, windSpeed, runwayHeading);
        const headwind = aviationMath_1.AviationMath.calculateHeadwind(windDirection, windSpeed, runwayHeading);
        const tailwind = aviationMath_1.AviationMath.calculateTailwind(windDirection, windSpeed, runwayHeading);
        return {
            runway: "",
            heading: runwayHeading,
            crosswind,
            headwind,
            tailwind,
            windAngle: aviationMath_1.AviationMath.angleDifference(windDirection, runwayHeading)
        };
    }
    static runwayScore(crosswind, tailwind) {
        let score = 100;
        score -= Math.abs(crosswind) * 2.5;
        score -= tailwind * 5;
        return aviationMath_1.AviationMath.clamp(score, 0, 100);
    }
    static runwayStatus(crosswind, tailwind) {
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
    static selectBestRunway(orientation, windDirection, windSpeed) {
        const headings = this.parseOrientation(orientation);
        const first = this.calculateComponents(headings[0], windDirection, windSpeed);
        first.runway =
            orientation.split("/")[0];
        const second = this.calculateComponents(headings[1], windDirection, windSpeed);
        second.runway =
            orientation.split("/")[1];
        const firstScore = this.runwayScore(first.crosswind, first.tailwind);
        const secondScore = this.runwayScore(second.crosswind, second.tailwind);
        return firstScore >= secondScore
            ? first
            : second;
    }
    static isOperational(crosswind, tailwind, maxCrosswind = 25, maxTailwind = 10) {
        return (Math.abs(crosswind) <= maxCrosswind &&
            tailwind <= maxTailwind);
    }
    static landingDistanceCorrection(tailwind, runwayWet) {
        let correction = 0;
        correction += tailwind * 5;
        if (runwayWet)
            correction += 15;
        return correction;
    }
    static takeoffDistanceCorrection(tailwind, densityAltitude) {
        let correction = 0;
        correction += tailwind * 4;
        correction += densityAltitude / 1000;
        return correction;
    }
}
exports.RunwayMath = RunwayMath;
//# sourceMappingURL=runwayMath.js.map