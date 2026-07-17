"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindRules = void 0;
const aviationMath_1 = require("../helpers/aviationMath");
class WindRules {
    static evaluate(wx) {
        const crosswind = Math.abs(wx.crosswindComponent ?? 0);
        const headwind = wx.headwindComponent ?? 0;
        const tailwind = wx.tailwindComponent ?? 0;
        const score = this.calculateRiskScore(wx.windSpeed, crosswind, wx.windGust);
        const severity = this.determineSeverity(score);
        const operationalStatus = this.operationalStatus(score);
        return {
            windDirection: wx.windDirection,
            windSpeed: wx.windSpeed,
            gust: wx.windGust,
            crosswind,
            headwind,
            tailwind,
            severity,
            score,
            operationalStatus,
            runwayRecommendation: this.runwayRecommendation(wx),
            pilotMessage: this.pilotMessage(score),
            atcMessage: this.atcMessage(score),
            dispatcherMessage: this.dispatcherMessage(score),
            airportMessage: this.airportMessage(score),
            recommendations: this.recommendations(score)
        };
    }
    static calculateRiskScore(windSpeed, crosswind, gust) {
        let score = 0;
        if (windSpeed >= 45)
            score += 30;
        else if (windSpeed >= 35)
            score += 22;
        else if (windSpeed >= 25)
            score += 14;
        else if (windSpeed >= 15)
            score += 6;
        if (crosswind >= 35)
            score += 35;
        else if (crosswind >= 25)
            score += 25;
        else if (crosswind >= 20)
            score += 18;
        else if (crosswind >= 15)
            score += 10;
        else if (crosswind >= 10)
            score += 5;
        if (gust != null &&
            gust > windSpeed) {
            const spread = gust - windSpeed;
            if (spread >= 20)
                score += 18;
            else if (spread >= 15)
                score += 12;
            else if (spread >= 10)
                score += 6;
        }
        return aviationMath_1.AviationMath.clamp(score, 0, 100);
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
    static runwayRecommendation(wx) {
        const crosswind = Math.abs(wx.crosswindComponent ?? 0);
        const tailwind = Math.abs(wx.tailwindComponent ?? 0);
        if (crosswind > 30)
            return "Crosswind exceeds most aircraft operating limits. Consider runway change or delay.";
        if (tailwind > 10)
            return "Tailwind component is high. Prefer opposite runway if available.";
        if (crosswind > 20)
            return "Use runway with the lowest available crosswind component.";
        if (wx.headwindComponent != null && wx.headwindComponent > 5)
            return "Current runway provides a favourable headwind component.";
        return "Current runway is suitable for normal operations.";
    }
    static pilotMessage(score) {
        if (score <= 10)
            return "Wind conditions are favourable for normal operations.";
        if (score <= 30)
            return "Maintain awareness of changing wind conditions during approach and departure.";
        if (score <= 60)
            return "Exercise caution due to elevated wind or crosswind conditions.";
        return "Strong winds present a significant operational hazard. Delay or diversion may be necessary.";
    }
    static atcMessage(score) {
        if (score <= 10)
            return "Normal runway operations.";
        if (score <= 30)
            return "Monitor wind changes and update runway configuration if required.";
        if (score <= 60)
            return "Expect increased spacing and runway changes.";
        return "Restrict operations to aircraft capable of operating in current wind conditions.";
    }
    static dispatcherMessage(score) {
        if (score <= 10)
            return "No wind-related operational restrictions.";
        if (score <= 30)
            return "Review destination weather trends before dispatch.";
        if (score <= 60)
            return "Consider additional fuel and alternate airport planning.";
        return "Recommend delaying dispatch until wind conditions improve.";
    }
    static airportMessage(score) {
        if (score <= 10)
            return "Wind conditions are within normal airport operational limits.";
        if (score <= 30)
            return "Monitor wind conditions and advise airside personnel.";
        if (score <= 60)
            return "Review runway configuration and secure ground equipment.";
        return "Restrict apron operations until wind conditions improve.";
    }
    static recommendations(score) {
        if (score <= 10) {
            return [
                "Normal operations.",
                "Continue routine wind monitoring."
            ];
        }
        if (score <= 30) {
            return [
                "Monitor wind trend.",
                "Brief flight crew on possible runway changes.",
                "Review crosswind limits."
            ];
        }
        if (score <= 60) {
            return [
                "Consider alternate runway.",
                "Review aircraft crosswind limitations.",
                "Increase ATC separation if necessary.",
                "Prepare alternate aerodrome."
            ];
        }
        return [
            "Delay departures where possible.",
            "Expect diversions.",
            "Restrict light aircraft operations.",
            "Review emergency procedures.",
            "Continuously monitor wind observations."
        ];
    }
    static hasWindShear(wx) {
        return wx.lowLevelWindShear === true;
    }
    static hasDangerousGusts(wx) {
        if (wx.windGust == null)
            return false;
        return (wx.windGust - wx.windSpeed) >= 15;
    }
    static exceedsCrosswindLimit(wx, limit) {
        return Math.abs(wx.crosswindComponent ?? 0) > limit;
    }
    static exceedsTailwindLimit(wx, limit = 10) {
        return (wx.tailwindComponent ?? 0) > limit;
    }
    static hasStrongHeadwind(wx) {
        return (wx.headwindComponent ?? 0) >= 20;
    }
    static suitableForLightAircraft(wx) {
        return (wx.windSpeed <= 20 &&
            Math.abs(wx.crosswindComponent ?? 0) <= 10 &&
            !this.hasWindShear(wx));
    }
    static suitableForCommercialAircraft(wx) {
        return (wx.windSpeed <= 40 &&
            Math.abs(wx.crosswindComponent ?? 0) <= 25 &&
            (wx.tailwindComponent ?? 0) <= 10 &&
            !this.hasWindShear(wx));
    }
    static suitableForGeneralAviation(wx) {
        return (wx.windSpeed <= 25 &&
            Math.abs(wx.crosswindComponent ?? 0) <= 15 &&
            (wx.tailwindComponent ?? 0) <= 5);
    }
    static runwaySuitable(wx) {
        return (!this.exceedsCrosswindLimit(wx, 25) &&
            !this.exceedsTailwindLimit(wx, 10));
    }
    static trend(previousWind, currentWind) {
        const difference = currentWind - previousWind;
        if (difference >= 5)
            return "INCREASING";
        if (difference <= -5)
            return "DECREASING";
        return "STEADY";
    }
    static directionChangedSignificantly(previousDirection, currentDirection) {
        let diff = Math.abs(currentDirection - previousDirection);
        if (diff > 180)
            diff = 360 - diff;
        return diff >= 30;
    }
    static summary(wx) {
        const assessment = this.evaluate(wx);
        return `Wind ${assessment.windDirection}° at ${assessment.windSpeed} kt with ${assessment.crosswind.toFixed(1)} kt crosswind. Operational status: ${assessment.operationalStatus}.`;
    }
}
exports.WindRules = WindRules;
//# sourceMappingURL=wind.rules.js.map