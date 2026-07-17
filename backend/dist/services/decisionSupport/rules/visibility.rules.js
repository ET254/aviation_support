"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisibilityRules = void 0;
class VisibilityRules {
    static evaluate(wx) {
        const visibility = wx.visibility ?? 99999;
        const category = this.determineFlightCategory(visibility);
        const severity = this.determineSeverity(visibility);
        const score = this.calculateRiskScore(visibility);
        const operationalStatus = this.operationalStatus(score);
        return {
            visibility,
            category,
            severity,
            score,
            operationalStatus,
            colour: this.colour(score),
            pilotMessage: this.pilotMessage(category),
            atcMessage: this.atcMessage(category),
            dispatcherMessage: this.dispatcherMessage(category),
            airportMessage: this.airportMessage(category),
            recommendations: this.recommendations(category)
        };
    }
    static determineFlightCategory(visibility) {
        if (visibility >= 8000)
            return "VFR";
        if (visibility >= 5000)
            return "MVFR";
        if (visibility >= 1600)
            return "IFR";
        return "LIFR";
    }
    static determineSeverity(visibility) {
        if (visibility >= 10000)
            return "NONE";
        if (visibility >= 8000)
            return "LOW";
        if (visibility >= 5000)
            return "MODERATE";
        if (visibility >= 1600)
            return "HIGH";
        return "EXTREME";
    }
    static calculateRiskScore(visibility) {
        if (visibility >= 10000)
            return 0;
        if (visibility >= 8000)
            return 10;
        if (visibility >= 5000)
            return 25;
        if (visibility >= 3000)
            return 40;
        if (visibility >= 1600)
            return 60;
        if (visibility >= 800)
            return 80;
        return 100;
    }
    static operationalStatus(score) {
        if (score <= 10)
            return "NORMAL";
        if (score <= 35)
            return "CAUTION";
        if (score <= 70)
            return "RESTRICTED";
        return "CRITICAL";
    }
    static colour(score) {
        if (score <= 10)
            return "#22c55e";
        if (score <= 35)
            return "#eab308";
        if (score <= 70)
            return "#f97316";
        return "#dc2626";
    }
    static pilotMessage(category) {
        switch (category) {
            case "VFR":
                return "Excellent visibility. Normal VFR operations.";
            case "MVFR":
                return "Marginal visual conditions. Increased vigilance advised.";
            case "IFR":
                return "Instrument Flight Rules required. Expect approach limitations.";
            case "LIFR":
                return "Extremely poor visibility. Instrument approach only. Diversion may be required.";
        }
    }
    static atcMessage(category) {
        switch (category) {
            case "VFR":
                return "Normal aerodrome operations.";
            case "MVFR":
                return "Increase spacing and monitor deteriorating conditions.";
            case "IFR":
                return "Apply IFR separation standards and expect arrival delays.";
            case "LIFR":
                return "Restrict traffic flow. Low visibility procedures should be active.";
        }
    }
    static dispatcherMessage(category) {
        switch (category) {
            case "VFR":
                return "No operational restrictions expected.";
            case "MVFR":
                return "Review destination alternates and fuel planning.";
            case "IFR":
                return "Dispatch under IFR. Alternate aerodrome likely required.";
            case "LIFR":
                return "High diversion risk. Delay or reroute operations if necessary.";
        }
    }
    static airportMessage(category) {
        switch (category) {
            case "VFR":
                return "Airport visibility is within normal operating limits.";
            case "MVFR":
                return "Monitor visibility and prepare for possible operational restrictions.";
            case "IFR":
                return "Prepare Low Visibility Procedures and coordinate airport operations.";
            case "LIFR":
                return "Activate Low Visibility Procedures and restrict visibility-dependent operations.";
        }
    }
    static recommendations(category) {
        switch (category) {
            case "VFR":
                return [
                    "Normal visual operations permitted.",
                    "Maintain routine monitoring of visibility.",
                    "No visibility-related operational restrictions."
                ];
            case "MVFR":
                return [
                    "Exercise additional caution during approach and departure.",
                    "Review alternate aerodromes.",
                    "Increase flight crew situational awareness.",
                    "Monitor visibility trend closely."
                ];
            case "IFR":
                return [
                    "Operate under Instrument Flight Rules.",
                    "Ensure instrument approach procedures are available.",
                    "Review alternate airport requirements.",
                    "Expect possible delays and increased ATC separation."
                ];
            case "LIFR":
                return [
                    "Activate Low Visibility Procedures (LVP).",
                    "Only suitably equipped aircraft should operate.",
                    "Consider delaying departures.",
                    "Expect holding or diversion.",
                    "Monitor runway visual range continuously."
                ];
        }
    }
    static isLowVisibility(wx) {
        return wx.visibility < 5000;
    }
    static isVeryLowVisibility(wx) {
        return wx.visibility < 1600;
    }
    static isBelowCATI(wx) {
        return wx.visibility < 550;
    }
    static isBelowCATII(wx) {
        return wx.visibility < 300;
    }
    static isBelowCATIII(wx) {
        return wx.visibility < 75;
    }
    static requiresLVP(wx) {
        return wx.visibility < 800;
    }
    static canOperateVFR(wx) {
        return wx.visibility >= 5000;
    }
    static canOperateIFR(wx) {
        return wx.visibility >= 550;
    }
    static isAirportClosedByVisibility(wx) {
        return wx.visibility < 75;
    }
    static trend(previousVisibility, currentVisibility) {
        const difference = currentVisibility - previousVisibility;
        if (difference > 500)
            return "IMPROVING";
        if (difference < -500)
            return "DETERIORATING";
        return "STEADY";
    }
    static summary(wx) {
        const assessment = this.evaluate(wx);
        return `${assessment.category} conditions with ${assessment.visibility} m visibility. Operational status: ${assessment.operationalStatus}.`;
    }
}
exports.VisibilityRules = VisibilityRules;
//# sourceMappingURL=visibility.rules.js.map