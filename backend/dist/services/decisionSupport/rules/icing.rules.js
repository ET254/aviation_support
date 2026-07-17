"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IcingRules = void 0;
class IcingRules {
    static evaluate(wx) {
        const score = this.calculateRiskScore(wx);
        return {
            icingPresent: this.hasIcing(wx),
            severity: this.determineSeverity(score),
            score,
            operationalStatus: this.operationalStatus(score),
            freezingLevel: wx.freezingLevel,
            supercooledLiquidWater: wx.supercooledLiquidWater ?? false,
            freezingRain: wx.freezingRain ?? false,
            freezingDrizzle: wx.freezingDrizzle ?? false,
            pilotMessage: this.pilotMessage(score),
            atcMessage: this.atcMessage(score),
            dispatcherMessage: this.dispatcherMessage(score),
            airportMessage: this.airportMessage(score),
            recommendations: this.recommendations(score)
        };
    }
    static calculateRiskScore(wx) {
        let score = 0;
        if (wx.icing)
            score += 20;
        switch (wx.icingSeverity) {
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
        if (wx.supercooledLiquidWater)
            score += 20;
        if (wx.freezingRain)
            score += 30;
        if (wx.freezingDrizzle)
            score += 15;
        if (wx.temperature <= 5 &&
            wx.temperature >= -20 &&
            (wx.relativeHumidity ?? 0) >= 80) {
            score += 10;
        }
        return Math.min(score, 100);
    }
    static hasIcing(wx) {
        return (wx.icing === true ||
            wx.freezingRain === true ||
            wx.freezingDrizzle === true ||
            wx.supercooledLiquidWater === true);
    }
    static determineSeverity(score) {
        if (score == 0)
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
            return "No icing hazard detected. Continue normal operations.";
        if (score <= 20)
            return "Light icing possible. Monitor outside air temperature and aircraft surfaces.";
        if (score <= 50)
            return "Moderate icing expected. Avoid prolonged flight in visible moisture and prepare anti-icing/de-icing systems.";
        return "Severe icing conditions. Avoid affected airspace immediately or divert.";
    }
    static atcMessage(score) {
        if (score === 0)
            return "No icing restrictions required.";
        if (score <= 20)
            return "Advise pilots of possible light icing reports.";
        if (score <= 50)
            return "Broadcast icing advisories and coordinate altitude changes where possible.";
        return "Issue severe icing advisories and coordinate rerouting around affected airspace.";
    }
    static dispatcherMessage(score) {
        if (score === 0)
            return "No icing-related dispatch restrictions.";
        if (score <= 20)
            return "Review forecast icing levels before release.";
        if (score <= 50)
            return "Plan alternate routing or flight levels to minimize icing exposure.";
        return "Delay dispatch or route aircraft around severe icing areas.";
    }
    static airportMessage(score) {
        if (score === 0)
            return "No airport de-icing required.";
        if (score <= 20)
            return "Prepare de-icing equipment and monitor conditions.";
        if (score <= 50)
            return "Coordinate aircraft de-icing and anti-icing operations.";
        return "Activate full de-icing procedures and suspend affected operations if necessary.";
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
                "Monitor temperature and humidity trends.",
                "Arm anti-icing systems if equipped.",
                "Review forecast freezing levels."
            ];
        }
        if (score <= 50) {
            return [
                "Use anti-icing systems before entering icing conditions.",
                "Exit icing conditions as soon as practical.",
                "Monitor ice accumulation continuously.",
                "Consider altitude changes.",
                "Review alternate airport availability."
            ];
        }
        return [
            "Avoid flight through severe icing.",
            "Delay departure if necessary.",
            "Activate aircraft de-icing before departure.",
            "Request immediate routing around icing areas.",
            "Consider diversion to a safer airport.",
            "Use certified anti-icing/de-icing equipment only."
        ];
    }
    static hasAirframeIcing(wx) {
        return (this.hasIcing(wx) &&
            wx.temperature <= 5 &&
            wx.temperature >= -20);
    }
    static hasEngineIcing(wx) {
        return (wx.temperature <= 10 &&
            wx.temperature >= -10 &&
            (wx.relativeHumidity ?? 0) >= 80);
    }
    static carburetorIcingRisk(wx) {
        const temp = wx.temperature;
        const rh = wx.relativeHumidity ?? 0;
        if (temp <= -5)
            return "LOW";
        if (temp <= 5 && rh >= 80)
            return "HIGH";
        if (temp <= 20 && rh >= 60)
            return "MODERATE";
        if (temp <= 30 && rh >= 85)
            return "SEVERE";
        return "LOW";
    }
    static hasSupercooledLiquidWater(wx) {
        return wx.supercooledLiquidWater === true;
    }
    static lowFreezingLevel(wx) {
        return (wx.freezingLevel != null &&
            wx.freezingLevel < 8000);
    }
    static requiresDeicing(wx) {
        return (this.hasAirframeIcing(wx) ||
            wx.freezingRain === true ||
            wx.freezingDrizzle === true);
    }
    static suitableForCommercialOperations(wx) {
        return (!this.hasAirframeIcing(wx) &&
            !wx.freezingRain &&
            this.determineSeverity(this.calculateRiskScore(wx)) !== "EXTREME");
    }
    static suitableForGeneralAviation(wx) {
        return (!this.hasIcing(wx));
    }
    static summary(wx) {
        const assessment = this.evaluate(wx);
        const hazards = [];
        if (this.hasAirframeIcing(wx))
            hazards.push("Airframe Icing");
        if (this.hasEngineIcing(wx))
            hazards.push("Engine Icing");
        if (wx.freezingRain)
            hazards.push("Freezing Rain");
        if (wx.freezingDrizzle)
            hazards.push("Freezing Drizzle");
        if (this.hasSupercooledLiquidWater(wx))
            hazards.push("Supercooled Liquid Water");
        if (hazards.length === 0)
            hazards.push("No significant icing hazards");
        return `Icing Severity: ${assessment.severity}. Operational Status: ${assessment.operationalStatus}. Hazards: ${hazards.join(", ")}.`;
    }
}
exports.IcingRules = IcingRules;
//# sourceMappingURL=icing.rules.js.map