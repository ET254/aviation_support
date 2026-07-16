"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskScore = void 0;
const aviationMath_1 = require("../helpers/aviationMath");
class RiskScore {
    static calculate(wx) {
        const visibility = this.visibilityRisk(wx.visibility);
        const wind = this.windRisk(wx.windSpeed, wx.crosswindComponent, wx.windGust);
        const runway = this.runwayRisk(wx.runwayCondition);
        const cloud = this.cloudRisk(wx.cloudBase, wx.cloudAmount);
        const precipitation = this.precipitationRisk(wx.precipitationType, wx.precipitationIntensity);
        const icing = this.icingRisk(wx);
        const turbulence = this.turbulenceRisk(wx);
        const thunderstorm = this.thunderstormRisk(wx);
        const volcanicAsh = this.volcanicAshRisk(wx);
        const densityAltitude = this.densityAltitudeRisk(wx.densityAltitude);
        const total = aviationMath_1.AviationMath.clamp(visibility +
            wind +
            runway +
            cloud +
            precipitation +
            icing +
            turbulence +
            thunderstorm +
            volcanicAsh +
            densityAltitude, 0, 100);
        return {
            visibility,
            wind,
            runway,
            cloud,
            precipitation,
            icing,
            turbulence,
            thunderstorm,
            volcanicAsh,
            densityAltitude,
            total,
            category: this.category(total)
        };
    }
    static visibilityRisk(visibility) {
        if (visibility == null)
            return 0;
        if (visibility >= 10000)
            return 0;
        if (visibility >= 8000)
            return 5;
        if (visibility >= 5000)
            return 10;
        if (visibility >= 3000)
            return 18;
        if (visibility >= 1500)
            return 25;
        if (visibility >= 800)
            return 35;
        return 45;
    }
    static windRisk(windSpeed, crosswind, gust) {
        let score = 0;
        if (windSpeed != null) {
            if (windSpeed > 35)
                score += 18;
            else if (windSpeed > 25)
                score += 12;
            else if (windSpeed > 18)
                score += 7;
        }
        if (crosswind != null) {
            const c = Math.abs(crosswind);
            if (c > 30)
                score += 20;
            else if (c > 20)
                score += 15;
            else if (c > 15)
                score += 10;
            else if (c > 10)
                score += 5;
        }
        if (gust != null && windSpeed != null) {
            const spread = gust - windSpeed;
            if (spread > 15)
                score += 10;
            else if (spread > 10)
                score += 6;
        }
        return score;
    }
    static runwayRisk(condition) {
        switch (condition) {
            case "DRY":
                return 0;
            case "DAMP":
                return 3;
            case "WET":
                return 8;
            case "SLUSH":
                return 18;
            case "SNOW":
                return 22;
            case "ICE":
                return 30;
            default:
                return 0;
        }
    }
    static cloudRisk(cloudBase, cloudAmount) {
        let score = 0;
        if (cloudBase != null) {
            if (cloudBase < 200)
                score += 20;
            else if (cloudBase < 500)
                score += 14;
            else if (cloudBase < 1000)
                score += 8;
        }
        if (cloudAmount != null) {
            if (cloudAmount >= 7)
                score += 8;
            else if (cloudAmount >= 5)
                score += 5;
        }
        return score;
    }
    static precipitationRisk(type, intensity) {
        if (!type || type === "NONE")
            return 0;
        let score = 0;
        switch (type) {
            case "RAIN":
                score += 6;
                break;
            case "DRIZZLE":
                score += 4;
                break;
            case "SNOW":
                score += 15;
                break;
            case "SLEET":
                score += 18;
                break;
            case "HAIL":
                score += 25;
                break;
            case "FREEZING_RAIN":
                score += 30;
                break;
            case "FREEZING_DRIZZLE":
                score += 25;
                break;
            default:
                score += 8;
        }
        switch (intensity) {
            case "LIGHT":
                score += 4;
                break;
            case "MODERATE":
                score += 8;
                break;
            case "HEAVY":
                score += 14;
                break;
            case "VIOLENT":
                score += 20;
                break;
        }
        return score;
    }
    static icingRisk(wx) {
        if (!wx.icing)
            return 0;
        switch (wx.icingSeverity) {
            case "LIGHT":
                return 8;
            case "MODERATE":
                return 15;
            case "SEVERE":
                return 25;
            case "EXTREME":
                return 35;
            default:
                return 12;
        }
    }
    static turbulenceRisk(wx) {
        if (!wx.turbulence)
            return 0;
        switch (wx.turbulenceSeverity) {
            case "LIGHT":
                return 5;
            case "MODERATE":
                return 12;
            case "SEVERE":
                return 22;
            case "EXTREME":
                return 35;
            default:
                return 10;
        }
    }
    static thunderstormRisk(wx) {
        if (!wx.thunderstorm)
            return 0;
        return 25;
    }
    static volcanicAshRisk(wx) {
        return wx.volcanicAsh
            ? 40
            : 0;
    }
    static densityAltitudeRisk(densityAltitude) {
        if (densityAltitude == null)
            return 0;
        if (densityAltitude < 5000)
            return 0;
        if (densityAltitude < 7000)
            return 5;
        if (densityAltitude < 9000)
            return 10;
        if (densityAltitude < 11000)
            return 15;
        return 20;
    }
    static category(score) {
        if (score < 20)
            return "LOW";
        if (score < 45)
            return "MODERATE";
        if (score < 70)
            return "HIGH";
        return "EXTREME";
    }
}
exports.RiskScore = RiskScore;
//# sourceMappingURL=riskScore.js.map