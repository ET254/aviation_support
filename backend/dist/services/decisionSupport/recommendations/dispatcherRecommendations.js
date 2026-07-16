"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatcherRecommendations = void 0;
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
class DispatcherRecommendations {
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
            recommendations.push(visibility.dispatcherMessage);
        }
        if (wind.score > 0) {
            hazards.push("Strong Wind");
            recommendations.push(wind.dispatcherMessage);
        }
        if (runway.score > 0) {
            hazards.push("Runway Condition");
            recommendations.push(runway.dispatcherMessage);
        }
        if (cloud.score > 0) {
            hazards.push("Low Cloud");
            recommendations.push(cloud.dispatcherMessage);
        }
        if (icing.score > 0) {
            hazards.push("Icing");
            recommendations.push(icing.dispatcherMessage);
        }
        if (turbulence.score > 0) {
            hazards.push("Turbulence");
            recommendations.push(turbulence.dispatcherMessage);
        }
        if (thunderstorm.score > 0) {
            hazards.push("Thunderstorm");
            recommendations.push(thunderstorm.dispatcherMessage);
        }
        if (precipitation.score > 0) {
            hazards.push("Precipitation");
            recommendations.push(precipitation.dispatcherMessage);
        }
        if (densityAltitude.score > 0) {
            hazards.push("High Density Altitude");
            recommendations.push(densityAltitude.dispatcherMessage);
        }
        if (volcanicAsh.score > 0) {
            hazards.push("Volcanic Ash");
            recommendations.push(volcanicAsh.dispatcherMessage);
        }
        const highestScore = Math.max(visibility.score, wind.score, runway.score, cloud.score, icing.score, turbulence.score, thunderstorm.score, precipitation.score, densityAltitude.score, volcanicAsh.score);
        let operationalRisk;
        if (highestScore < 20) {
            operationalRisk = "LOW";
        }
        else if (highestScore < 45) {
            operationalRisk = "MODERATE";
        }
        else if (highestScore < 70) {
            operationalRisk = "HIGH";
        }
        else {
            operationalRisk = "EXTREME";
        }
        let dispatchStatus;
        if (volcanicAsh.score >= 70) {
            dispatchStatus = "CANCEL";
        }
        else if (highestScore >= 70) {
            dispatchStatus = "DIVERT";
        }
        else if (highestScore >= 45) {
            dispatchStatus = "DELAY";
        }
        else if (highestScore >= 20) {
            dispatchStatus = "RELEASE_WITH_RESTRICTIONS";
        }
        else {
            dispatchStatus = "RELEASE";
        }
        const alternateRequired = visibility.score >= 35 ||
            thunderstorm.score >= 35 ||
            runway.score >= 35;
        const additionalFuelRequired = alternateRequired ||
            thunderstorm.score >= 30 ||
            turbulence.score >= 30 ||
            wind.score >= 30;
        const payloadRestriction = densityAltitude.score >= 35 ||
            runway.score >= 45 ||
            wind.score >= 45;
        const routeModificationRequired = thunderstorm.score >= 35 ||
            turbulence.score >= 35 ||
            volcanicAsh.score > 0;
        const deicingRequired = icing.score >= 20;
        const cancellationRecommended = dispatchStatus === "CANCEL";
        const delayRecommended = dispatchStatus === "DELAY";
        const uniqueRecommendations = [
            ...new Set(recommendations)
        ];
        if (alternateRequired) {
            uniqueRecommendations.push("Select and validate a suitable alternate airport.");
        }
        if (additionalFuelRequired) {
            uniqueRecommendations.push("Upload additional contingency, holding and alternate fuel.");
        }
        if (payloadRestriction) {
            uniqueRecommendations.push("Review payload and consider weight restrictions.");
        }
        if (routeModificationRequired) {
            uniqueRecommendations.push("Plan an alternate routing to avoid hazardous weather.");
        }
        if (deicingRequired) {
            uniqueRecommendations.push("Coordinate aircraft de-icing before departure.");
        }
        if (delayRecommended) {
            uniqueRecommendations.push("Delay flight release until operational conditions improve.");
        }
        if (cancellationRecommended) {
            uniqueRecommendations.push("Cancel the flight and notify all operational stakeholders.");
        }
        if (volcanicAsh.score > 0) {
            uniqueRecommendations.push("Coordinate with VAAC and avoid all volcanic ash contaminated airspace.");
        }
        if (thunderstorm.score >= 35) {
            uniqueRecommendations.push("Review convective SIGMETs and expected thunderstorm movement.");
        }
        if (turbulence.score >= 35) {
            uniqueRecommendations.push("Plan flight level changes to minimize turbulence exposure.");
        }
        if (wind.score >= 35) {
            uniqueRecommendations.push("Review crosswind limitations for departure and destination airports.");
        }
        if (visibility.score >= 35) {
            uniqueRecommendations.push("Verify destination weather meets approach minima.");
        }
        const summary = [
            `Dispatch Status: ${dispatchStatus}`,
            `Operational Risk: ${operationalRisk}`,
            alternateRequired
                ? "Alternate Airport Required"
                : "Alternate Airport Not Required",
            additionalFuelRequired
                ? "Additional Fuel Required"
                : "Standard Fuel Planning",
            hazards.length > 0
                ? `Hazards: ${hazards.join(", ")}`
                : "No significant operational hazards."
        ].join(". ");
        return {
            dispatchStatus,
            operationalRisk,
            alternateRequired,
            additionalFuelRequired,
            payloadRestriction,
            routeModificationRequired,
            deicingRequired,
            cancellationRecommended,
            delayRecommended,
            summary,
            hazards,
            recommendations: uniqueRecommendations
        };
    }
}
exports.DispatcherRecommendations = DispatcherRecommendations;
//# sourceMappingURL=dispatcherRecommendations.js.map