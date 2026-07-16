"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ATCRecommendations = void 0;
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
class ATCRecommendations {
    static generate(wx) {
        const hazards = [];
        const recommendations = [];
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
            recommendations.push(visibility.atcMessage);
        }
        if (wind.score > 0) {
            hazards.push("Strong Wind");
            recommendations.push(wind.atcMessage);
        }
        if (runway.score > 0) {
            hazards.push("Runway Condition");
            recommendations.push(runway.atcMessage);
        }
        if (cloud.score > 0) {
            hazards.push("Low Cloud");
            recommendations.push(cloud.atcMessage);
        }
        if (icing.score > 0) {
            hazards.push("Icing");
            recommendations.push(icing.atcMessage);
        }
        if (turbulence.score > 0) {
            hazards.push("Turbulence");
            recommendations.push(turbulence.atcMessage);
        }
        if (thunderstorm.score > 0) {
            hazards.push("Thunderstorm");
            recommendations.push(thunderstorm.atcMessage);
        }
        if (precipitation.score > 0) {
            hazards.push("Precipitation");
            recommendations.push(precipitation.atcMessage);
        }
        if (densityAltitude.score > 0) {
            hazards.push("High Density Altitude");
            recommendations.push(densityAltitude.atcMessage);
        }
        if (volcanicAsh.score > 0) {
            hazards.push("Volcanic Ash");
            recommendations.push(volcanicAsh.atcMessage);
        }
        const highestScore = Math.max(visibility.score, wind.score, runway.score, cloud.score, icing.score, turbulence.score, thunderstorm.score, precipitation.score, densityAltitude.score, volcanicAsh.score);
        let airportStatus;
        if (volcanicAsh.score >= 70) {
            airportStatus = "CLOSED";
        }
        else if (highestScore >= 70) {
            airportStatus = "RESTRICTED";
        }
        else if (highestScore >= 40) {
            airportStatus = "LIMITED";
        }
        else {
            airportStatus = "OPEN";
        }
        let trafficFlow;
        if (airportStatus === "CLOSED") {
            trafficFlow = "SUSPENDED";
        }
        else if (thunderstorm.score >= 45 ||
            visibility.score >= 45 ||
            runway.score >= 45) {
            trafficFlow = "HOLDING";
        }
        else if (highestScore >= 35) {
            trafficFlow = "REDUCED";
        }
        else {
            trafficFlow = "NORMAL";
        }
        let runwayStatus;
        if (runway.score >= 70 ||
            volcanicAsh.score >= 70) {
            runwayStatus = "CLOSED";
        }
        else if (runway.score >= 45) {
            runwayStatus = "RESTRICTED";
        }
        else if (runway.score >= 20) {
            runwayStatus = "CAUTION";
        }
        else {
            runwayStatus = "AVAILABLE";
        }
        let separation;
        if (visibility.score >= 45 ||
            thunderstorm.score >= 45) {
            separation = "MAXIMUM";
        }
        else if (visibility.score >= 20 ||
            wind.score >= 20 ||
            turbulence.score >= 20) {
            separation = "INCREASED";
        }
        else {
            separation = "NORMAL";
        }
        const lowVisibilityProcedures = visibility.score >= 35;
        const arrivalRestrictions = highestScore >= 45;
        const departureRestrictions = highestScore >= 45;
        const holdingRequired = trafficFlow === "HOLDING";
        const groundStopRecommended = airportStatus === "CLOSED" ||
            volcanicAsh.score >= 70 ||
            thunderstorm.score >= 70;
        const runwayInspectionRequired = runway.score >= 35 ||
            precipitation.score >= 40;
        const uniqueRecommendations = [
            ...new Set(recommendations)
        ];
        if (lowVisibilityProcedures) {
            uniqueRecommendations.push("Activate Low Visibility Procedures (LVP).");
        }
        if (arrivalRestrictions) {
            uniqueRecommendations.push("Restrict arrival rate based on current weather conditions.");
        }
        if (departureRestrictions) {
            uniqueRecommendations.push("Apply departure sequencing and spacing restrictions.");
        }
        if (holdingRequired) {
            uniqueRecommendations.push("Coordinate airborne holding and expected delay information.");
        }
        if (groundStopRecommended) {
            uniqueRecommendations.push("Initiate ground stop for affected departures.");
        }
        if (runwayInspectionRequired) {
            uniqueRecommendations.push("Dispatch runway inspection team immediately.");
        }
        if (runwayStatus === "CLOSED") {
            uniqueRecommendations.push("Issue NOTAM for runway closure.");
        }
        if (airportStatus === "CLOSED") {
            uniqueRecommendations.push("Coordinate airport closure with Airport Operations, Airlines and AIS.");
        }
        if (volcanicAsh.score >= 70) {
            uniqueRecommendations.push("Coordinate with VAAC and Meteorological Office for volcanic ash advisories.");
        }
        if (thunderstorm.score >= 45) {
            uniqueRecommendations.push("Monitor convective cells and suspend runway operations if lightning safety limits are exceeded.");
        }
        if (wind.score >= 40) {
            uniqueRecommendations.push("Review active runway configuration for prevailing wind.");
        }
        const summary = [
            `Airport Status: ${airportStatus}`,
            `Traffic Flow: ${trafficFlow}`,
            `Runway Status: ${runwayStatus}`,
            `Separation: ${separation}`,
            hazards.length > 0
                ? `Hazards: ${hazards.join(", ")}`
                : "No significant operational hazards."
        ].join(". ");
        return {
            airportStatus,
            trafficFlow,
            runwayStatus,
            separation,
            lowVisibilityProcedures,
            arrivalRestrictions,
            departureRestrictions,
            holdingRequired,
            groundStopRecommended,
            runwayInspectionRequired,
            summary,
            hazards,
            recommendations: uniqueRecommendations
        };
    }
}
exports.ATCRecommendations = ATCRecommendations;
//# sourceMappingURL=atcRecommendations.js.map