"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TurbulenceRules = void 0;
class TurbulenceRules {
    static evaluate(wx) {
        const score = this.calculateRiskScore(wx);
        return {
            turbulencePresent: this.hasTurbulence(wx),
            severity: this.determineSeverity(score),
            score,
            operationalStatus: this.operationalStatus(score),
            clearAirTurbulence: wx.clearAirTurbulence ?? false,
            mountainWave: wx.mountainWave ?? false,
            rotorCloud: wx.rotorCloud ?? false,
            pilotMessage: this.pilotMessage(score),
            atcMessage: this.atcMessage(score),
            dispatcherMessage: this.dispatcherMessage(score),
            airportMessage: this.airportMessage(score),
            recommendations: this.recommendations(score)
        };
    }
    static calculateRiskScore(wx) {
        let score = 0;
        if (wx.turbulence)
            score += 15;
        switch (wx.turbulenceSeverity) {
            case "LIGHT":
                score += 10;
                break;
            case "MODERATE":
                score += 25;
                break;
            case "SEVERE":
                score += 40;
                break;
            case "EXTREME":
                score += 60;
                break;
        }
        if (wx.clearAirTurbulence)
            score += 20;
        if (wx.mountainWave)
            score += 15;
        if (wx.rotorCloud)
            score += 20;
        if (wx.lowLevelWindShear)
            score += 20;
        if (wx.windGust != null &&
            wx.windSpeed > 0 &&
            (wx.windGust - wx.windSpeed) >= 15) {
            score += 10;
        }
        if (wx.jetStreamSpeed != null &&
            wx.jetStreamSpeed >= 100) {
            score += 10;
        }
        return Math.min(score, 100);
    }
    static hasTurbulence(wx) {
        return (wx.turbulence === true ||
            wx.clearAirTurbulence === true ||
            wx.mountainWave === true ||
            wx.rotorCloud === true ||
            wx.lowLevelWindShear === true);
    }
    static determineSeverity(score) {
        if (score === 0)
            return "NONE";
        if (score <= 20)
            return "LIGHT";
        if (score <= 45)
            return "MODERATE";
        if (score <= 70)
            return "SEVERE";
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
    static pilotMessage(score) {
        if (score === 0)
            return "No significant turbulence expected. Normal flight operations.";
        if (score <= 20)
            return "Light turbulence possible. Maintain passenger awareness and monitor ride quality.";
        if (score <= 50)
            return "Moderate turbulence expected. Keep seat belt signs ON and avoid unnecessary cabin movement.";
        return "Severe turbulence expected. Avoid affected airspace if possible and request altitude or route changes.";
    }
    static atcMessage(score) {
        if (score === 0)
            return "No turbulence advisories required.";
        if (score <= 20)
            return "Advise pilots of reported light turbulence.";
        if (score <= 50)
            return "Broadcast turbulence advisories and coordinate altitude changes where possible.";
        return "Issue severe turbulence warnings and coordinate immediate rerouting.";
    }
    static dispatcherMessage(score) {
        if (score === 0)
            return "No turbulence-related dispatch restrictions.";
        if (score <= 20)
            return "Review forecast turbulence before release.";
        if (score <= 50)
            return "Plan optimum cruising levels to minimize turbulence exposure.";
        return "Delay dispatch or reroute aircraft around severe turbulence areas.";
    }
    static airportMessage(score) {
        if (score === 0)
            return "No airport operational impact.";
        if (score <= 20)
            return "Monitor operational conditions.";
        if (score <= 50)
            return "Advise airport operators of expected turbulence and wind shear.";
        return "Restrict operations where necessary and coordinate with ATC during severe turbulence conditions.";
    }
    static recommendations(score) {
        if (score === 0) {
            return [
                "Continue normal operations.",
                "Maintain routine weather monitoring."
            ];
        }
        if (score <= 20) {
            return [
                "Monitor ride reports (PIREPs).",
                "Keep passengers informed.",
                "Monitor changing wind profiles."
            ];
        }
        if (score <= 50) {
            return [
                "Turn seat belt signs ON.",
                "Avoid unnecessary cabin movement.",
                "Coordinate altitude changes if required.",
                "Review alternate flight levels.",
                "Monitor SIGMETs for turbulence."
            ];
        }
        return [
            "Avoid severe turbulence areas.",
            "Request immediate altitude change if available.",
            "Consider rerouting around affected airspace.",
            "Suspend cabin service.",
            "Secure passengers and crew.",
            "Continuously monitor ride reports and SIGMET updates."
        ];
    }
    static hasClearAirTurbulence(wx) {
        return wx.clearAirTurbulence === true;
    }
    static hasMechanicalTurbulence(wx) {
        if (wx.windSpeed < 15)
            return false;
        return (wx.windSpeed >= 20 &&
            (wx.crosswindComponent ?? 0) >= 10);
    }
    static hasMountainWave(wx) {
        return wx.mountainWave === true;
    }
    static hasRotorCloud(wx) {
        return wx.rotorCloud === true;
    }
    static hasConvectiveTurbulence(wx) {
        return (wx.cumulonimbus === true ||
            wx.toweringCumulus === true ||
            wx.thunderstorm === true);
    }
    static hasLowLevelWindShear(wx) {
        return wx.lowLevelWindShear === true;
    }
    static hasJetStreamTurbulence(wx) {
        return (wx.jetStreamSpeed != null &&
            wx.jetStreamSpeed >= 100);
    }
    static suitableForCommercialOperations(wx) {
        const severity = this.determineSeverity(this.calculateRiskScore(wx));
        return severity !== "EXTREME";
    }
    static suitableForGeneralAviation(wx) {
        const severity = this.determineSeverity(this.calculateRiskScore(wx));
        return (severity === "NONE" ||
            severity === "LIGHT");
    }
    static summary(wx) {
        const assessment = this.evaluate(wx);
        const hazards = [];
        if (this.hasClearAirTurbulence(wx))
            hazards.push("Clear Air Turbulence");
        if (this.hasMechanicalTurbulence(wx))
            hazards.push("Mechanical Turbulence");
        if (this.hasMountainWave(wx))
            hazards.push("Mountain Wave");
        if (this.hasRotorCloud(wx))
            hazards.push("Rotor Cloud");
        if (this.hasConvectiveTurbulence(wx))
            hazards.push("Convective Turbulence");
        if (this.hasLowLevelWindShear(wx))
            hazards.push("Low Level Wind Shear");
        if (this.hasJetStreamTurbulence(wx))
            hazards.push("Jet Stream Turbulence");
        if (hazards.length === 0)
            hazards.push("No significant turbulence hazards");
        return `Turbulence Severity: ${assessment.severity}. Operational Status: ${assessment.operationalStatus}. Hazards: ${hazards.join(", ")}.`;
    }
}
exports.TurbulenceRules = TurbulenceRules;
//# sourceMappingURL=turbulence.rules.js.map