"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrecipitationRules = void 0;
class PrecipitationRules {
    static evaluate(wx) {
        const score = this.calculateRiskScore(wx);
        return {
            precipitationPresent: this.hasPrecipitation(wx),
            type: wx.precipitationType ?? "NONE",
            intensity: wx.precipitationIntensity ?? "NONE",
            severity: this.determineSeverity(score),
            score,
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
        switch (wx.precipitationType) {
            case "RAIN":
                score += 10;
                break;
            case "DRIZZLE":
                score += 5;
                break;
            case "SNOW":
                score += 25;
                break;
            case "SLEET":
                score += 20;
                break;
            case "HAIL":
                score += 35;
                break;
            case "FREEZING_RAIN":
                score += 45;
                break;
            case "FREEZING_DRIZZLE":
                score += 35;
                break;
            case "ICE_PELLETS":
                score += 25;
                break;
        }
        switch (wx.precipitationIntensity) {
            case "LIGHT":
                score += 5;
                break;
            case "MODERATE":
                score += 15;
                break;
            case "HEAVY":
                score += 25;
                break;
            case "VIOLENT":
                score += 40;
                break;
        }
        return Math.min(score, 100);
    }
    static hasPrecipitation(wx) {
        return (wx.precipitationType != null &&
            wx.precipitationType !== "NONE");
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
            return "No significant precipitation. Normal flight operations.";
        if (score <= 20)
            return "Light precipitation expected. Monitor runway condition, visibility and braking action.";
        if (score <= 50)
            return "Moderate precipitation. Expect reduced visibility, increased landing distance and possible runway contamination.";
        return "Severe precipitation hazard. Delay departure or landing if necessary. Expect poor braking action, hydroplaning and significant operational impacts.";
    }
    static atcMessage(score) {
        if (score === 0)
            return "No precipitation-related operational restrictions.";
        if (score <= 20)
            return "Advise pilots of current precipitation and monitor runway conditions.";
        if (score <= 50)
            return "Issue precipitation advisories, monitor runway braking reports and coordinate traffic spacing.";
        return "Issue severe weather advisories. Consider runway changes, increased separation and operational restrictions.";
    }
    static dispatcherMessage(score) {
        if (score === 0)
            return "No precipitation-related dispatch restrictions.";
        if (score <= 20)
            return "Review destination and alternate weather before flight release.";
        if (score <= 50)
            return "Plan for contaminated runway operations and carry additional contingency fuel.";
        return "Delay dispatch or reroute aircraft. Review alternate airports and runway contamination reports.";
    }
    static airportMessage(score) {
        if (score === 0)
            return "Normal airport operations.";
        if (score <= 20)
            return "Monitor runway drainage and surface conditions.";
        if (score <= 50)
            return "Increase runway inspections and monitor braking action.";
        return "Restrict runway operations until precipitation intensity decreases and runway conditions improve.";
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
                "Monitor runway surface condition.",
                "Review braking action reports.",
                "Monitor visibility trends.",
                "Review latest METARs and TAFs."
            ];
        }
        if (score <= 50) {
            return [
                "Increase landing distance calculations.",
                "Use contaminated runway performance data.",
                "Carry additional contingency fuel.",
                "Monitor runway braking action continuously.",
                "Review alternate airport availability.",
                "Expect reduced visibility and increased stopping distance."
            ];
        }
        return [
            "Delay departures if operational limits are exceeded.",
            "Avoid contaminated runways whenever possible.",
            "Expect hydroplaning and poor braking action.",
            "Consider alternate airport operations.",
            "Increase aircraft separation.",
            "Suspend ground activities if conditions become unsafe.",
            "Continuously monitor runway inspections and weather updates."
        ];
    }
    static hydroplaningRisk(wx) {
        if (wx.precipitationType === "RAIN" ||
            wx.precipitationType === "FREEZING_RAIN") {
            switch (wx.precipitationIntensity) {
                case "LIGHT":
                    return "LOW";
                case "MODERATE":
                    return "MODERATE";
                case "HEAVY":
                    return "HIGH";
                case "VIOLENT":
                    return "EXTREME";
            }
        }
        return "LOW";
    }
    static runwayContaminated(wx) {
        return (wx.precipitationType !== undefined &&
            wx.precipitationType !== "NONE");
    }
    static estimatedBrakingAction(wx) {
        switch (wx.runwayCondition) {
            case "DRY":
                return "GOOD";
            case "DAMP":
                return "GOOD_TO_MEDIUM";
            case "WET":
                return "MEDIUM";
            case "SLUSH":
                return "MEDIUM_TO_POOR";
            case "SNOW":
            case "ICE":
                return "POOR";
            default:
                return "GOOD";
        }
    }
    static hasHeavyRain(wx) {
        return (wx.precipitationType === "RAIN" &&
            (wx.precipitationIntensity === "HEAVY" ||
                wx.precipitationIntensity === "VIOLENT"));
    }
    static hasFrozenPrecipitation(wx) {
        return (wx.precipitationType === "SNOW" ||
            wx.precipitationType === "SLEET" ||
            wx.precipitationType === "FREEZING_RAIN" ||
            wx.precipitationType === "FREEZING_DRIZZLE" ||
            wx.precipitationType === "ICE_PELLETS");
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
        if (this.hasHeavyRain(wx))
            hazards.push("Heavy Rain");
        if (this.hasFrozenPrecipitation(wx))
            hazards.push("Frozen Precipitation");
        if (this.runwayContaminated(wx))
            hazards.push("Runway Contamination");
        if (this.hydroplaningRisk(wx) === "HIGH" ||
            this.hydroplaningRisk(wx) === "EXTREME") {
            hazards.push("Hydroplaning Risk");
        }
        if (hazards.length === 0)
            hazards.push("No significant precipitation hazards");
        return `Precipitation Severity: ${assessment.severity}. Operational Status: ${assessment.operationalStatus}. Hazards: ${hazards.join(", ")}.`;
    }
}
exports.PrecipitationRules = PrecipitationRules;
//# sourceMappingURL=precipitation.rules.js.map