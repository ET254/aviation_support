"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirportRecommendations = void 0;
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
class AirportRecommendations {
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
            recommendations.push(visibility.airportMessage);
        }
        if (wind.score > 0) {
            hazards.push("Strong Wind");
            recommendations.push(wind.airportMessage);
        }
        if (runway.score > 0) {
            hazards.push("Runway Condition");
            recommendations.push(runway.airportMessage);
        }
        if (cloud.score > 0) {
            hazards.push("Low Cloud");
            recommendations.push(cloud.airportMessage);
        }
        if (icing.score > 0) {
            hazards.push("Icing");
            recommendations.push(icing.airportMessage);
        }
        if (turbulence.score > 0) {
            hazards.push("Turbulence");
            recommendations.push(turbulence.airportMessage);
        }
        if (thunderstorm.score > 0) {
            hazards.push("Thunderstorm");
            recommendations.push(thunderstorm.airportMessage);
        }
        if (precipitation.score > 0) {
            hazards.push("Precipitation");
            recommendations.push(precipitation.airportMessage);
        }
        if (densityAltitude.score > 0) {
            hazards.push("High Density Altitude");
            recommendations.push(densityAltitude.airportMessage);
        }
        if (volcanicAsh.score > 0) {
            hazards.push("Volcanic Ash");
            recommendations.push(volcanicAsh.airportMessage);
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
            airportStatus = "NORMAL";
        }
        const runwayOperations = runway.score < 70 &&
            volcanicAsh.score < 70;
        const apronOperations = thunderstorm.score < 45 &&
            wind.score < 45;
        const terminalOperations = airportStatus !== "CLOSED";
        const maintenanceRequired = runway.score >= 35 ||
            precipitation.score >= 35 ||
            wind.score >= 40;
        const emergencyStandby = thunderstorm.score >= 45 ||
            volcanicAsh.score >= 45 ||
            icing.score >= 45;
        const wildlifeInspectionRequired = precipitation.score >= 35 ||
            visibility.score >= 35;
        const deicingOperationsRequired = icing.score >= 20;
        const notamRequired = airportStatus !== "NORMAL" ||
            runway.score >= 35 ||
            volcanicAsh.score > 0;
        const uniqueRecommendations = [
            ...new Set(recommendations)
        ];
        if (maintenanceRequired) {
            uniqueRecommendations.push("Deploy airport maintenance teams to inspect and maintain operational areas.");
        }
        if (runwayOperations === false) {
            uniqueRecommendations.push("Suspend runway operations until safety conditions are restored.");
        }
        if (apronOperations === false) {
            uniqueRecommendations.push("Restrict apron activities and ground handling operations.");
        }
        if (deicingOperationsRequired) {
            uniqueRecommendations.push("Activate airport de-icing equipment and coordinate de-icing services.");
        }
        if (wildlifeInspectionRequired) {
            uniqueRecommendations.push("Conduct wildlife hazard inspection and activate wildlife control measures.");
        }
        if (emergencyStandby) {
            uniqueRecommendations.push("Place Airport Rescue and Fire Fighting (ARFF) services on heightened standby.");
        }
        if (notamRequired) {
            uniqueRecommendations.push("Issue or update applicable NOTAMs for airport users.");
        }
        if (volcanicAsh.score > 0) {
            uniqueRecommendations.push("Coordinate with the Meteorological Office and VAAC regarding volcanic ash advisories.");
        }
        if (thunderstorm.score >= 35) {
            uniqueRecommendations.push("Suspend ramp operations whenever lightning safety limits are exceeded.");
        }
        if (wind.score >= 35) {
            uniqueRecommendations.push("Secure loose ground equipment and review aircraft parking restrictions.");
        }
        if (precipitation.score >= 35) {
            uniqueRecommendations.push("Inspect runway drainage systems and monitor surface water accumulation.");
        }
        if (visibility.score >= 35) {
            uniqueRecommendations.push("Activate airport low visibility operational procedures.");
        }
        const summary = [
            `Airport Status: ${airportStatus}`,
            runwayOperations
                ? "Runway Operations Available"
                : "Runway Operations Restricted",
            apronOperations
                ? "Apron Operations Normal"
                : "Apron Operations Restricted",
            terminalOperations
                ? "Terminal Operations Active"
                : "Terminal Operations Suspended",
            hazards.length > 0
                ? `Hazards: ${hazards.join(", ")}`
                : "No significant operational hazards."
        ].join(". ");
        return {
            airportStatus,
            runwayOperations,
            apronOperations,
            terminalOperations,
            maintenanceRequired,
            emergencyStandby,
            wildlifeInspectionRequired,
            deicingOperationsRequired,
            notamRequired,
            summary,
            hazards,
            recommendations: uniqueRecommendations
        };
    }
}
exports.AirportRecommendations = AirportRecommendations;
//# sourceMappingURL=airportRecommendations.js.map