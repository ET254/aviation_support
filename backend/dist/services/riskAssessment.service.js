"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskAssessmentService = void 0;
class RiskAssessmentService {
    static assess(weather) {
        const visibility = Number(weather.visibility ?? 99999);
        const cloudBase = Number(weather.cloudBase ?? 99999);
        const wind = Number(weather.windSpeed ?? 0);
        const crosswind = Math.abs(Number(weather.crosswindComponent ?? 0));
        const densityAltitude = Number(weather.densityAltitude ?? 0);
        const precipitation = Number(weather.precipitationIntensity ?? 0);
        const flightCategory = this.determineFlightCategory(visibility, cloudBase);
        const overallRisk = this.determineOverallRisk(flightCategory);
        const warnings = [];
        const visibilityRisk = this.evaluateVisibility(visibility);
        const ceilingRisk = this.evaluateCeiling(cloudBase);
        const windRisk = this.evaluateWind(wind);
        const crosswindRisk = this.evaluateCrosswind(crosswind);
        const turbulenceRisk = this.evaluateTurbulence(wind);
        const icingRisk = this.evaluateIcing(weather.temperature);
        const thunderstormRisk = this.evaluateThunderstorm(precipitation);
        const densityAltitudeRisk = this.evaluateDensityAltitude(densityAltitude);
        if (visibilityRisk === "CRITICAL") {
            warnings.push("Low Visibility Procedures Required");
        }
        if (crosswindRisk === "HIGH") {
            warnings.push("Crosswind exceeds operational limits");
        }
        if (icingRisk !== "NONE") {
            warnings.push("Icing conditions expected");
        }
        if (thunderstormRisk !== "NONE") {
            warnings.push("Thunderstorm activity expected");
        }
        if (densityAltitudeRisk === "HIGH") {
            warnings.push("High density altitude may reduce aircraft performance");
        }
        return {
            overallRisk,
            flightCategory,
            visibilityRisk,
            ceilingRisk,
            windRisk,
            crosswindRisk,
            turbulenceRisk,
            icingRisk,
            thunderstormRisk,
            densityAltitudeRisk,
            recommendation: this.getRecommendation(overallRisk),
            warnings,
        };
    }
    static determineFlightCategory(visibility, cloudBase) {
        if (visibility < 800 ||
            cloudBase < 200)
            return "LIFR";
        if (visibility < 1600 ||
            cloudBase < 500)
            return "IFR";
        if (visibility < 5000 ||
            cloudBase < 1000)
            return "MVFR";
        return "VFR";
    }
    static determineOverallRisk(category) {
        switch (category) {
            case "VFR":
                return "LOW";
            case "MVFR":
                return "MEDIUM";
            case "IFR":
                return "HIGH";
            case "LIFR":
                return "EXTREME";
        }
    }
    static evaluateVisibility(visibility) {
        if (visibility < 800)
            return "CRITICAL";
        if (visibility < 1500)
            return "POOR";
        if (visibility < 5000)
            return "CAUTION";
        return "GOOD";
    }
    static evaluateCeiling(cloudBase) {
        if (cloudBase < 200)
            return "CRITICAL";
        if (cloudBase < 500)
            return "POOR";
        if (cloudBase < 1000)
            return "CAUTION";
        return "GOOD";
    }
    static evaluateWind(wind) {
        if (wind >= 40)
            return "EXTREME";
        if (wind >= 30)
            return "HIGH";
        if (wind >= 20)
            return "MEDIUM";
        return "LOW";
    }
    static evaluateCrosswind(crosswind) {
        if (crosswind >= 30)
            return "HIGH";
        if (crosswind >= 20)
            return "MEDIUM";
        if (crosswind >= 12)
            return "CAUTION";
        return "GOOD";
    }
    static evaluateTurbulence(wind) {
        if (wind >= 45)
            return "SEVERE";
        if (wind >= 30)
            return "MODERATE";
        if (wind >= 20)
            return "LIGHT";
        return "NONE";
    }
    static evaluateIcing(temperature) {
        if (temperature === undefined)
            return "NONE";
        if (temperature <= 2 &&
            temperature >= -20)
            return "POSSIBLE";
        return "NONE";
    }
    static evaluateThunderstorm(precipitation) {
        if (precipitation >= 20)
            return "HIGH";
        if (precipitation >= 10)
            return "MEDIUM";
        if (precipitation >= 5)
            return "LOW";
        return "NONE";
    }
    static evaluateDensityAltitude(densityAltitude) {
        if (densityAltitude >= 9000)
            return "HIGH";
        if (densityAltitude >= 7000)
            return "MEDIUM";
        if (densityAltitude >= 5000)
            return "LOW";
        return "NORMAL";
    }
    static getRecommendation(risk) {
        switch (risk) {
            case "LOW":
                return "Normal Operations";
            case "MEDIUM":
                return "Exercise Caution";
            case "HIGH":
                return "Operational Restrictions Recommended";
            case "EXTREME":
                return "Operations Not Recommended";
        }
    }
}
exports.RiskAssessmentService = RiskAssessmentService;
//# sourceMappingURL=riskAssessment.service.js.map