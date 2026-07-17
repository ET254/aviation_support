"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PilotRecommendations = void 0;
const visibility_rules_1 = require("../rules/visibility.rules");
const wind_rules_1 = require("../rules/wind.rules");
const runway_rules_1 = require("../rules/runway.rules");
const cloud_rules_1 = require("../rules/cloud.rules");
const icing_rules_1 = require("../rules/icing.rules");
const turbulence_rules_1 = require("../rules/turbulence.rules");
const thunderstorm_rules_1 = require("../rules/thunderstorm.rules");
const precipitation_rules_1 = require("../rules/precipitation.rules");
const densityAltitude_rules_1 = require("../rules/densityAltitude.rules");
const volcanicAsh_rules_1 = require("../rules/volcanicAsh.rules");
class PilotRecommendations {
    static generate(wx) {
        const recommendations = [];
        const hazards = [];
        const requiredActions = [];
        const visibility = visibility_rules_1.VisibilityRules.evaluate(wx);
        const wind = wind_rules_1.WindRules.evaluate(wx);
        const runway = runway_rules_1.RunwayRules.evaluate(wx);
        const cloud = cloud_rules_1.CloudRules.evaluate(wx);
        const icing = icing_rules_1.IcingRules.evaluate(wx);
        const turbulence = turbulence_rules_1.TurbulenceRules.evaluate(wx);
        const thunderstorm = thunderstorm_rules_1.ThunderstormRules.evaluate(wx);
        const precipitation = precipitation_rules_1.PrecipitationRules.evaluate(wx);
        const densityAltitude = densityAltitude_rules_1.DensityAltitudeRules.evaluate(wx);
        const volcanicAsh = volcanicAsh_rules_1.VolcanicAshRules.evaluate(wx);
        if (visibility.score > 0) {
            hazards.push("Reduced Visibility");
            recommendations.push(visibility.pilotMessage);
        }
        if (wind.score > 0) {
            hazards.push("Strong Wind");
            recommendations.push(wind.pilotMessage);
        }
        if (runway.score > 0) {
            hazards.push("Runway Condition");
            recommendations.push(runway.pilotMessage);
        }
        if (cloud.score > 0) {
            hazards.push("Cloud");
            recommendations.push(cloud.pilotMessage);
        }
        if (icing.score > 0) {
            hazards.push("Icing");
            recommendations.push(icing.pilotMessage);
        }
        if (turbulence.score > 0) {
            hazards.push("Turbulence");
            recommendations.push(turbulence.pilotMessage);
        }
        if (thunderstorm.score > 0) {
            hazards.push("Thunderstorm");
            recommendations.push(thunderstorm.pilotMessage);
        }
        if (precipitation.score > 0) {
            hazards.push("Precipitation");
            recommendations.push(precipitation.pilotMessage);
        }
        if (densityAltitude.score > 0) {
            hazards.push("High Density Altitude");
            recommendations.push(densityAltitude.pilotMessage);
        }
        if (volcanicAsh.score > 0) {
            hazards.push("Volcanic Ash");
            recommendations.push(volcanicAsh.pilotMessage);
        }
        if (visibility.score >= 45) {
            requiredActions.push("Operate under IFR procedures.");
        }
        if (wind.score >= 40) {
            requiredActions.push("Review crosswind and gust limitations.");
        }
        if (runway.score >= 40) {
            requiredActions.push("Use contaminated runway performance calculations.");
        }
        if (icing.score >= 40) {
            requiredActions.push("Aircraft de-icing/anti-icing required.");
        }
        if (turbulence.score >= 40) {
            requiredActions.push("Fasten seatbelt sign throughout flight.");
        }
        if (thunderstorm.score >= 40) {
            requiredActions.push("Avoid convective weather by at least 20 NM.");
        }
        if (precipitation.score >= 40) {
            requiredActions.push("Review braking action and hydroplaning risk.");
        }
        if (densityAltitude.score >= 40) {
            requiredActions.push("Reduce aircraft weight and verify takeoff performance.");
        }
        if (volcanicAsh.score > 0) {
            requiredActions.push("Avoid volcanic ash. Divert immediately if encountered.");
        }
        const highestScore = Math.max(visibility.score, wind.score, runway.score, cloud.score, icing.score, turbulence.score, thunderstorm.score, precipitation.score, densityAltitude.score, volcanicAsh.score);
        let overallRisk;
        if (highestScore < 20)
            overallRisk = "LOW";
        else if (highestScore < 45)
            overallRisk = "MODERATE";
        else if (highestScore < 70)
            overallRisk = "HIGH";
        else
            overallRisk = "EXTREME";
        let overallStatus;
        if (highestScore < 20) {
            overallStatus = "GO";
        }
        else if (highestScore < 45) {
            overallStatus = "GO_WITH_CAUTION";
        }
        else if (highestScore < 70) {
            overallStatus = "DELAY";
        }
        else if (volcanicAsh.score >= 70) {
            overallStatus = "NO_GO";
        }
        else {
            overallStatus = "DIVERT";
        }
        const summaryParts = [];
        summaryParts.push(`Overall Status: ${overallStatus}`);
        summaryParts.push(`Overall Risk: ${overallRisk}`);
        if (hazards.length > 0) {
            summaryParts.push(`Hazards: ${hazards.join(", ")}`);
        }
        else {
            summaryParts.push("No significant operational hazards detected.");
        }
        const uniqueRecommendations = [...new Set(recommendations)];
        const uniqueActions = [...new Set(requiredActions)];
        if (overallStatus === "GO" &&
            uniqueActions.length === 0) {
            uniqueActions.push("Continue normal flight operations.");
        }
        if (overallStatus === "GO_WITH_CAUTION") {
            uniqueActions.push("Review latest METAR, TAF and NOTAM before departure.");
        }
        if (overallStatus === "DELAY") {
            uniqueActions.push("Delay departure until weather improves.");
        }
        if (overallStatus === "DIVERT") {
            uniqueActions.push("Prepare alternate airport and diversion procedures.");
        }
        if (overallStatus === "NO_GO") {
            uniqueActions.push("Do not commence flight under current conditions.");
        }
        return {
            overallStatus,
            overallRisk,
            summary: summaryParts.join(". "),
            recommendations: uniqueRecommendations,
            hazards,
            requiredActions: uniqueActions
        };
    }
}
exports.PilotRecommendations = PilotRecommendations;
//# sourceMappingURL=pilotRecommendations.js.map