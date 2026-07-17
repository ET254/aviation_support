"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThunderstormRules = void 0;
class ThunderstormRules {
    static evaluate(wx) {
        const score = this.calculateRiskScore(wx);
        return {
            thunderstormPresent: this.hasThunderstorm(wx),
            severity: this.determineSeverity(score),
            score,
            operationalStatus: this.operationalStatus(score),
            lightning: wx.lightning ?? false,
            hail: wx.hail ?? false,
            tornado: wx.tornado ?? false,
            funnelCloud: wx.funnelCloud ?? false,
            squall: wx.squall ?? false,
            pilotMessage: this.pilotMessage(score),
            atcMessage: this.atcMessage(score),
            dispatcherMessage: this.dispatcherMessage(score),
            airportMessage: this.airportMessage(score),
            recommendations: this.recommendations(score)
        };
    }
    static calculateRiskScore(wx) {
        let score = 0;
        if (wx.thunderstorm)
            score += 25;
        if (wx.lightning)
            score += 15;
        if (wx.hail)
            score += 25;
        if (wx.tornado)
            score += 40;
        if (wx.funnelCloud)
            score += 20;
        if (wx.squall)
            score += 20;
        if (wx.cumulonimbus)
            score += 15;
        if (wx.toweringCumulus)
            score += 10;
        if (wx.lowLevelWindShear)
            score += 20;
        if (wx.windGust != null &&
            wx.windSpeed > 0 &&
            (wx.windGust - wx.windSpeed) >= 15) {
            score += 10;
        }
        return Math.min(score, 100);
    }
    static hasThunderstorm(wx) {
        return (wx.thunderstorm === true ||
            wx.lightning === true ||
            wx.cumulonimbus === true ||
            wx.hail === true ||
            wx.tornado === true ||
            wx.funnelCloud === true ||
            wx.squall === true);
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
            return "No thunderstorm activity affecting flight operations.";
        if (score <= 20)
            return "Isolated convective activity nearby. Monitor ATIS, METAR, TAF and onboard weather radar.";
        if (score <= 50)
            return "Thunderstorms expected in the vicinity. Avoid cumulonimbus cells by at least 20 NM and prepare for turbulence and wind shear.";
        return "Severe thunderstorm hazard. Do not penetrate thunderstorm cells. Delay departure or divert immediately if necessary.";
    }
    static atcMessage(score) {
        if (score === 0)
            return "Normal traffic flow. No thunderstorm advisories required.";
        if (score <= 20)
            return "Provide pilots with convective weather information and monitor storm development.";
        if (score <= 50)
            return "Issue thunderstorm advisories, anticipate runway configuration changes and coordinate deviations.";
        return "Suspend or restrict operations where necessary. Coordinate rerouting around convective cells and issue severe weather warnings.";
    }
    static dispatcherMessage(score) {
        if (score === 0)
            return "No thunderstorm-related dispatch restrictions.";
        if (score <= 20)
            return "Review convective forecasts before flight release.";
        if (score <= 50)
            return "Plan alternate routes, additional fuel and alternate airports to avoid thunderstorm activity.";
        return "Delay dispatch or reroute aircraft around severe convective weather.";
    }
    static airportMessage(score) {
        if (score === 0)
            return "Normal airport operations.";
        if (score <= 20)
            return "Monitor nearby convective activity.";
        if (score <= 50)
            return "Prepare ramp personnel and review contingency procedures.";
        return "Suspend airside operations where necessary and activate severe weather procedures.";
    }
    static recommendations(score) {
        if (score === 0) {
            return [
                "Continue normal operations.",
                "Maintain routine weather surveillance."
            ];
        }
        if (score <= 20) {
            return [
                "Monitor radar and satellite imagery.",
                "Review latest METARs, TAFs and SIGMETs.",
                "Brief flight crews on nearby convective activity."
            ];
        }
        if (score <= 50) {
            return [
                "Avoid cumulonimbus clouds by at least 20 NM.",
                "Expect turbulence, hail and wind shear near storms.",
                "Carry additional contingency fuel.",
                "Review alternate airport options.",
                "Coordinate deviations with ATC.",
                "Monitor lightning detection systems continuously."
            ];
        }
        return [
            "Suspend ground operations where lightning safety limits are exceeded.",
            "Delay departures until convective activity clears.",
            "Avoid all thunderstorm penetration.",
            "Expect severe turbulence, hail, microbursts and wind shear.",
            "Consider immediate diversion if airborne.",
            "Implement airport severe weather procedures.",
            "Protect ground personnel and equipment.",
            "Continuously monitor radar, SIGMETs and lightning networks."
        ];
    }
    static hasLightning(wx) {
        return wx.lightning === true;
    }
    static hasHail(wx) {
        return wx.hail === true;
    }
    static hasTornado(wx) {
        return wx.tornado === true;
    }
    static hasFunnelCloud(wx) {
        return wx.funnelCloud === true;
    }
    static hasSquall(wx) {
        return wx.squall === true;
    }
    static hasMicroburst(wx) {
        if (wx.lowLevelWindShear &&
            wx.windGust != null &&
            wx.windSpeed > 0) {
            return ((wx.windGust - wx.windSpeed) >= 20);
        }
        return false;
    }
    static hasDownburst(wx) {
        if (wx.windGust != null &&
            wx.windSpeed > 0) {
            return ((wx.windGust - wx.windSpeed) >= 25);
        }
        return false;
    }
    static hasConvectiveWeather(wx) {
        return (wx.cumulonimbus === true ||
            wx.toweringCumulus === true ||
            wx.thunderstorm === true);
    }
    static groundOperationsAllowed(wx) {
        return !(this.hasLightning(wx) ||
            this.hasTornado(wx) ||
            this.hasMicroburst(wx));
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
        if (this.hasLightning(wx))
            hazards.push("Lightning");
        if (this.hasHail(wx))
            hazards.push("Hail");
        if (this.hasTornado(wx))
            hazards.push("Tornado");
        if (this.hasFunnelCloud(wx))
            hazards.push("Funnel Cloud");
        if (this.hasSquall(wx))
            hazards.push("Squall Line");
        if (this.hasMicroburst(wx))
            hazards.push("Microburst");
        if (this.hasDownburst(wx))
            hazards.push("Downburst");
        if (this.hasConvectiveWeather(wx))
            hazards.push("Convective Weather");
        if (hazards.length === 0)
            hazards.push("No significant thunderstorm hazards");
        return `Thunderstorm Severity: ${assessment.severity}. Operational Status: ${assessment.operationalStatus}. Hazards: ${hazards.join(", ")}.`;
    }
}
exports.ThunderstormRules = ThunderstormRules;
//# sourceMappingURL=thunderstorm.rules.js.map