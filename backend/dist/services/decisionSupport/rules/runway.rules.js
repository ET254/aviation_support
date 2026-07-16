"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunwayRules = void 0;
class RunwayRules {
    static evaluate(wx) {
        const score = this.calculateRiskScore(wx);
        return {
            condition: wx.runwayCondition ?? "UNKNOWN",
            brakingAction: wx.brakingAction ?? "UNKNOWN",
            frictionCoefficient: wx.runwayFrictionCoefficient,
            contaminationPercent: wx.runwayContaminationPercent,
            standingWater: wx.standingWater ?? false,
            snowDepth: wx.snowDepth,
            slushDepth: wx.slushDepth,
            score,
            severity: this.determineSeverity(score),
            operationalStatus: this.operationalStatus(score),
            pilotMessage: this.pilotMessage(score),
            atcMessage: this.atcMessage(score),
            dispatcherMessage: this.dispatcherMessage(score),
            airportMessage: this.airportMessage(score),
            recommendations: this.recommendations(score)
        };
    }
    static calculateRiskScore(wx) {
        let score = 0;
        switch (wx.runwayCondition) {
            case "DRY":
                score += 0;
                break;
            case "DAMP":
                score += 5;
                break;
            case "WET":
                score += 12;
                break;
            case "SLUSH":
                score += 25;
                break;
            case "SNOW":
                score += 30;
                break;
            case "ICE":
                score += 40;
                break;
            default:
                score += 10;
        }
        if (wx.runwayContaminationPercent != null) {
            if (wx.runwayContaminationPercent >= 75)
                score += 25;
            else if (wx.runwayContaminationPercent >= 50)
                score += 18;
            else if (wx.runwayContaminationPercent >= 25)
                score += 10;
        }
        if (wx.standingWater)
            score += 15;
        if (wx.runwayFrictionCoefficient != null) {
            if (wx.runwayFrictionCoefficient < 0.25)
                score += 30;
            else if (wx.runwayFrictionCoefficient < 0.30)
                score += 20;
            else if (wx.runwayFrictionCoefficient < 0.40)
                score += 10;
        }
        return Math.min(score, 100);
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
    static pilotMessage(score) {
        if (score <= 10)
            return "Runway conditions are suitable for normal operations.";
        if (score <= 30)
            return "Exercise caution during takeoff and landing. Expect slightly reduced braking.";
        if (score <= 60)
            return "Reduced braking effectiveness expected. Review landing performance calculations.";
        return "Runway condition presents a significant hazard. Delay or diversion should be considered.";
    }
    static atcMessage(score) {
        if (score <= 10)
            return "Normal runway operations.";
        if (score <= 30)
            return "Monitor runway condition reports and provide braking action updates.";
        if (score <= 60)
            return "Expect increased runway occupancy time and reduced movement rates.";
        return "Consider runway closure or severe operational restrictions until conditions improve.";
    }
    static dispatcherMessage(score) {
        if (score <= 10)
            return "No runway-related operational restrictions.";
        if (score <= 30)
            return "Review destination runway reports before dispatch.";
        if (score <= 60)
            return "Evaluate alternate airports and additional fuel requirements.";
        return "Recommend delaying dispatch or selecting an alternate destination.";
    }
    static airportMessage(score) {
        if (score <= 10)
            return "Runway available for normal operations.";
        if (score <= 30)
            return "Increase runway inspections and monitor braking action.";
        if (score <= 60)
            return "Restrict runway operations until surface conditions improve.";
        return "Close the runway if necessary and issue the appropriate NOTAM.";
    }
    static recommendations(score) {
        if (score <= 10) {
            return [
                "Normal runway operations.",
                "Continue routine runway inspections."
            ];
        }
        if (score <= 30) {
            return [
                "Increase runway condition monitoring.",
                "Issue braking action advisories.",
                "Review landing distance calculations."
            ];
        }
        if (score <= 60) {
            return [
                "Use maximum available runway length.",
                "Reduce operational tempo if necessary.",
                "Increase separation between arriving aircraft.",
                "Review aircraft performance limitations."
            ];
        }
        return [
            "Suspend operations if safety cannot be assured.",
            "Consider runway closure.",
            "Issue immediate NOTAM if required.",
            "Activate airport emergency procedures.",
            "Coordinate continuously with airport operations."
        ];
    }
    static runwayUsable(wx) {
        return !this.shouldCloseRunway(wx);
    }
    static brakingAssessment(wx) {
        switch (wx.brakingAction) {
            case "GOOD":
                return "Good braking action.";
            case "GOOD_TO_MEDIUM":
                return "Slight reduction in braking performance.";
            case "MEDIUM":
                return "Moderate braking reduction.";
            case "MEDIUM_TO_POOR":
                return "Landing performance significantly reduced.";
            case "POOR":
                return "Poor braking. Extreme caution required.";
            case "UNRELIABLE":
                return "Braking reports unreliable.";
            default:
                return "No braking action report available.";
        }
    }
    static frictionStatus(wx) {
        const friction = wx.runwayFrictionCoefficient;
        if (friction == null)
            return "UNKNOWN";
        if (friction >= 0.40)
            return "GOOD";
        if (friction >= 0.30)
            return "MEDIUM";
        if (friction >= 0.25)
            return "POOR";
        return "VERY_POOR";
    }
    static hasStandingWater(wx) {
        return wx.standingWater === true;
    }
    static excessiveSnow(wx) {
        return ((wx.snowDepth ?? 0) >= 10);
    }
    static excessiveSlush(wx) {
        return ((wx.slushDepth ?? 0) >= 5);
    }
    static heavilyContaminated(wx) {
        return ((wx.runwayContaminationPercent ?? 0) >= 50);
    }
    static shouldCloseRunway(wx) {
        if (wx.runwayCondition === "ICE")
            return true;
        if ((wx.runwayFrictionCoefficient ?? 1) < 0.25)
            return true;
        if ((wx.runwayContaminationPercent ?? 0) >= 75)
            return true;
        if (this.excessiveSnow(wx))
            return true;
        if (this.excessiveSlush(wx))
            return true;
        return false;
    }
    static suitableForCommercialAircraft(wx) {
        return (!this.shouldCloseRunway(wx) &&
            (wx.brakingAction === "GOOD" ||
                wx.brakingAction === "GOOD_TO_MEDIUM" ||
                wx.brakingAction === "MEDIUM"));
    }
    static suitableForGeneralAviation(wx) {
        return (!this.shouldCloseRunway(wx) &&
            wx.runwayCondition !== "ICE");
    }
    static summary(wx) {
        const assessment = this.evaluate(wx);
        return `Runway condition: ${assessment.condition}. Braking: ${assessment.brakingAction}. Operational status: ${assessment.operationalStatus}.`;
    }
}
exports.RunwayRules = RunwayRules;
//# sourceMappingURL=runway.rules.js.map