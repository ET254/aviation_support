"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DensityAltitudeRules = void 0;
class DensityAltitudeRules {
    static evaluate(wx) {
        const densityAltitude = wx.densityAltitude ?? 0;
        const score = this.calculateRiskScore(densityAltitude);
        return {
            densityAltitude,
            pressureAltitude: wx.pressureAltitude,
            severity: this.determineSeverity(score),
            score,
            operationalStatus: this.operationalStatus(score),
            aircraftPerformanceReduction: this.aircraftPerformanceReduction(densityAltitude),
            takeoffPerformanceReduction: this.takeoffPerformanceReduction(densityAltitude),
            climbPerformanceReduction: this.climbPerformanceReduction(densityAltitude),
            landingPerformanceIncrease: this.landingPerformanceIncrease(densityAltitude),
            pilotMessage: this.pilotMessage(score),
            atcMessage: this.atcMessage(score),
            dispatcherMessage: this.dispatcherMessage(score),
            airportMessage: this.airportMessage(score),
            recommendations: this.recommendations(score)
        };
    }
    static calculateRiskScore(densityAltitude) {
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
    static determineSeverity(score) {
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
    static operationalStatus(score) {
        if (score === 0)
            return "NORMAL";
        if (score <= 20)
            return "CAUTION";
        if (score <= 50)
            return "RESTRICTED";
        return "CRITICAL";
    }
    static aircraftPerformanceReduction(densityAltitude) {
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
    static takeoffPerformanceReduction(densityAltitude) {
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
    static climbPerformanceReduction(densityAltitude) {
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
    static landingPerformanceIncrease(densityAltitude) {
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
    static pilotMessage(score) {
        if (score === 0)
            return "Density altitude has minimal effect on aircraft performance.";
        if (score <= 20)
            return "Monitor aircraft weight and performance calculations before departure.";
        if (score <= 50)
            return "Expect reduced climb performance and longer takeoff distances. Review performance charts carefully.";
        return "Extreme density altitude. Consider delaying operations, reducing aircraft weight or selecting an alternate airport.";
    }
    static atcMessage(score) {
        if (score === 0)
            return "No density altitude operational concerns.";
        if (score <= 20)
            return "Monitor departures for reduced climb performance.";
        if (score <= 50)
            return "Increase departure spacing where appropriate and anticipate slower climb rates.";
        return "Coordinate extended departures, reduced payload operations and possible delays due to degraded aircraft performance.";
    }
    static dispatcherMessage(score) {
        if (score === 0)
            return "No dispatch limitations related to density altitude.";
        if (score <= 20)
            return "Review aircraft performance data before flight release.";
        if (score <= 50)
            return "Evaluate payload restrictions, runway length and obstacle clearance requirements.";
        return "Reduce payload where necessary, consider cooler departure times and evaluate alternate airports.";
    }
    static airportMessage(score) {
        if (score === 0)
            return "Density altitude is within normal operational limits.";
        if (score <= 20)
            return "Monitor aircraft performance during departures.";
        if (score <= 50)
            return "Coordinate payload restrictions and runway performance planning.";
        return "Restrict heavy aircraft departures and consider delaying operations during peak temperatures.";
    }
    static recommendations(score) {
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
    static isHighElevationAirport(wx) {
        return (wx.elevation ?? 0) >= 5000;
    }
    static isHotAndHigh(wx) {
        return ((wx.temperature >= 30) &&
            ((wx.elevation ?? 0) >= 3000));
    }
    static obstacleClearanceRisk(wx) {
        const da = wx.densityAltitude ?? 0;
        if (da < 5000)
            return "LOW";
        if (da < 8000)
            return "MODERATE";
        if (da < 10000)
            return "HIGH";
        return "EXTREME";
    }
    static enginePerformanceReduction(densityAltitude) {
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
    static suitableForCommercialOperations(wx) {
        const severity = this.determineSeverity(this.calculateRiskScore(wx.densityAltitude ?? 0));
        return severity !== "EXTREME";
    }
    static suitableForGeneralAviation(wx) {
        const severity = this.determineSeverity(this.calculateRiskScore(wx.densityAltitude ?? 0));
        return (severity === "NONE" ||
            severity === "LOW");
    }
    static summary(wx) {
        const assessment = this.evaluate(wx);
        const notes = [];
        if (this.isHighElevationAirport(wx))
            notes.push("High Elevation Airport");
        if (this.isHotAndHigh(wx))
            notes.push("Hot-and-High Conditions");
        if (this.obstacleClearanceRisk(wx) === "HIGH" ||
            this.obstacleClearanceRisk(wx) === "EXTREME") {
            notes.push("Obstacle Clearance Risk");
        }
        if (assessment.aircraftPerformanceReduction > 0)
            notes.push(`Aircraft Performance Reduction ${assessment.aircraftPerformanceReduction}%`);
        if (assessment.takeoffPerformanceReduction > 0)
            notes.push(`Takeoff Performance Reduction ${assessment.takeoffPerformanceReduction}%`);
        if (assessment.climbPerformanceReduction > 0)
            notes.push(`Climb Performance Reduction ${assessment.climbPerformanceReduction}%`);
        if (assessment.landingPerformanceIncrease > 0)
            notes.push(`Landing Distance Increase ${assessment.landingPerformanceIncrease}%`);
        if (notes.length === 0)
            notes.push("No significant density altitude concerns");
        return `Density Altitude Severity: ${assessment.severity}. Operational Status: ${assessment.operationalStatus}. ${notes.join(", ")}.`;
    }
}
exports.DensityAltitudeRules = DensityAltitudeRules;
//# sourceMappingURL=densityAltitude.rules.js.map