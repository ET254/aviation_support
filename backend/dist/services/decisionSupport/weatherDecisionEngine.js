"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherDecisionEngine = void 0;
const visibility_rules_1 = require("./rules/visibility.rules");
const wind_rules_1 = require("./rules/wind.rules");
const runway_rules_1 = require("./rules/runway.rules");
const cloud_rules_1 = require("./rules/cloud.rules");
const icing_rules_1 = require("./rules/icing.rules");
const turbulence_rules_1 = require("./rules/turbulence.rules");
const thunderstorm_rules_1 = require("./rules/thunderstorm.rules");
const precipitation_rules_1 = require("./rules/precipitation.rules");
const densityAltitude_rules_1 = require("./rules/densityAltitude.rules");
const volcanicAsh_rules_1 = require("./rules/volcanicAsh.rules");
const pilotRecommendations_1 = require("./recommendations/pilotRecommendations");
const atcRecommendations_1 = require("./recommendations/atcRecommendations");
const dispatcherRecommendations_1 = require("./recommendations/dispatcherRecommendations");
const airportRecommendations_1 = require("./recommendations/airportRecommendations");
class WeatherDecisionEngine {
    static evaluate(wx) {
        const visibility = visibility_rules_1.VisibilityRules.evaluate(wx);
        const wind = wind_rules_1.WindRules.evaluate(wx);
        const runway = runway_rules_1.RunwayRules.evaluate(wx);
        const clouds = cloud_rules_1.CloudRules.evaluate(wx);
        const icing = icing_rules_1.IcingRules.evaluate(wx);
        const turbulence = turbulence_rules_1.TurbulenceRules.evaluate(wx);
        const thunderstorms = thunderstorm_rules_1.ThunderstormRules.evaluate(wx);
        const precipitation = precipitation_rules_1.PrecipitationRules.evaluate(wx);
        const densityAltitude = densityAltitude_rules_1.DensityAltitudeRules.evaluate(wx);
        const volcanicAsh = volcanicAsh_rules_1.VolcanicAshRules.evaluate(wx);
        const overallRiskScore = this.calculateOverallRisk([
            visibility.score,
            wind.score,
            runway.score,
            clouds.score,
            icing.score,
            turbulence.score,
            thunderstorms.score,
            precipitation.score,
            densityAltitude.score,
            volcanicAsh.score
        ]);
        const overallSeverity = this.determineSeverity(overallRiskScore);
        const operationalStatus = this.operationalStatus(overallRiskScore);
        const pilotRecommendations = pilotRecommendations_1.PilotRecommendations.generate(wx);
        const atcRecommendations = atcRecommendations_1.ATCRecommendations.generate(wx);
        const dispatcherRecommendations = dispatcherRecommendations_1.DispatcherRecommendations.generate(wx);
        const airportRecommendations = airportRecommendations_1.AirportRecommendations.generate(wx);
        return {
            observation: wx,
            visibility,
            wind,
            runway,
            clouds,
            icing,
            turbulence,
            thunderstorms,
            precipitation,
            densityAltitude,
            volcanicAsh,
            overallRiskScore,
            overallSeverity,
            operationalStatus,
            pilotRecommendations,
            atcRecommendations,
            dispatcherRecommendations,
            airportRecommendations
        };
    }
    static calculateOverallRisk(scores) {
        if (scores.length === 0)
            return 0;
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;
        const maximum = Math.max(...scores);
        return Math.round(average * 0.6 +
            maximum * 0.4);
    }
    static determineSeverity(score) {
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
    static operationalStatus(score) {
        if (score <= 10)
            return "NORMAL";
        if (score <= 30)
            return "CAUTION";
        if (score <= 60)
            return "RESTRICTED";
        return "CRITICAL";
    }
}
exports.WeatherDecisionEngine = WeatherDecisionEngine;
//# sourceMappingURL=weatherDecisionEngine.js.map