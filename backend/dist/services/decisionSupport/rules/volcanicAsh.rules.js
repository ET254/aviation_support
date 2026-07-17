"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolcanicAshRules = void 0;
class VolcanicAshRules {
    static evaluate(wx) {
        const score = this.calculateRiskScore(wx);
        return {
            volcanicAshPresent: this.hasVolcanicAsh(wx),
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
        if (wx.volcanicAsh)
            score += 70;
        if (wx.sigmetActive)
            score += 15;
        if (wx.warningMessages?.some(message => message.toLowerCase().includes("volcanic ash"))) {
            score += 15;
        }
        return Math.min(score, 100);
    }
    static hasVolcanicAsh(wx) {
        return wx.volcanicAsh === true;
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
    static pilotMessage(score) {
        if (score === 0)
            return "No volcanic ash hazard affecting flight operations.";
        if (score <= 20)
            return "Monitor volcanic ash advisories and SIGMET information before departure.";
        if (score <= 50)
            return "Avoid forecast volcanic ash areas. Prepare alternate routing and continuously monitor weather updates.";
        return "Severe volcanic ash hazard. Do NOT enter contaminated airspace. Divert immediately if volcanic ash is encountered in flight.";
    }
    static atcMessage(score) {
        if (score === 0)
            return "Normal ATC operations. No volcanic ash restrictions.";
        if (score <= 20)
            return "Advise pilots of volcanic ash advisories and monitor affected sectors.";
        if (score <= 50)
            return "Coordinate reroutes around volcanic ash contaminated airspace and increase pilot weather advisories.";
        return "Suspend operations within affected airspace where necessary. Coordinate rerouting with adjacent FIRs and issue volcanic ash advisories immediately.";
    }
    static dispatcherMessage(score) {
        if (score === 0)
            return "No volcanic ash dispatch restrictions.";
        if (score <= 20)
            return "Review VAAC products, SIGMETs and forecast charts before releasing flights.";
        if (score <= 50)
            return "Plan alternate routes and additional fuel to avoid volcanic ash contaminated airspace.";
        return "Do not dispatch aircraft through forecast ash clouds. Delay or reroute flights until safe routing is available.";
    }
    static airportMessage(score) {
        if (score === 0)
            return "No volcanic ash operational impact.";
        if (score <= 20)
            return "Monitor VAAC advisories and volcanic ash forecasts.";
        if (score <= 50)
            return "Coordinate airport contingency procedures and prepare operational restrictions.";
        return "Suspend airport operations if volcanic ash affects the aerodrome and issue the appropriate NOTAMs.";
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
                "Monitor VAAC advisories.",
                "Review SIGMETs before departure.",
                "Brief crews on potential volcanic activity."
            ];
        }
        if (score <= 50) {
            return [
                "Avoid forecast volcanic ash areas.",
                "Carry contingency fuel for rerouting.",
                "Monitor satellite imagery and SIGMET updates.",
                "Coordinate with ATC regarding route deviations.",
                "Review alternate airports before departure."
            ];
        }
        return [
            "Do NOT operate inside volcanic ash clouds.",
            "Delay departures until safe routing is available.",
            "Divert aircraft immediately if volcanic ash is encountered.",
            "Close affected airspace if required.",
            "Coordinate with VAAC, meteorological offices and ATC.",
            "Inspect aircraft thoroughly after any suspected ash encounter.",
            "Monitor engine parameters continuously during abnormal conditions."
        ];
    }
    static ashCloudEncounter(wx) {
        return (wx.volcanicAsh === true ||
            wx.warningMessages?.some(message => message.toLowerCase().includes("volcanic ash")) === true);
    }
    static engineDamageRisk(wx) {
        if (!this.hasVolcanicAsh(wx))
            return "LOW";
        const score = this.calculateRiskScore(wx);
        if (score <= 20)
            return "MODERATE";
        if (score <= 50)
            return "HIGH";
        return "EXTREME";
    }
    static windscreenContaminationRisk(wx) {
        return this.hasVolcanicAsh(wx);
    }
    static pitotStaticContaminationRisk(wx) {
        return this.hasVolcanicAsh(wx);
    }
    static recommendAirspaceClosure(wx) {
        return this.calculateRiskScore(wx) >= 70;
    }
    static suitableForCommercialOperations(wx) {
        return !this.hasVolcanicAsh(wx);
    }
    static suitableForGeneralAviation(wx) {
        return !this.hasVolcanicAsh(wx);
    }
    static summary(wx) {
        const assessment = this.evaluate(wx);
        const hazards = [];
        if (this.hasVolcanicAsh(wx))
            hazards.push("Volcanic Ash");
        if (this.ashCloudEncounter(wx))
            hazards.push("Ash Cloud");
        if (this.recommendAirspaceClosure(wx))
            hazards.push("Airspace Closure Recommended");
        if (this.engineDamageRisk(wx) === "HIGH" ||
            this.engineDamageRisk(wx) === "EXTREME") {
            hazards.push("Engine Damage Risk");
        }
        if (this.windscreenContaminationRisk(wx))
            hazards.push("Windscreen Contamination");
        if (this.pitotStaticContaminationRisk(wx))
            hazards.push("Pitot-Static Contamination");
        if (hazards.length === 0)
            hazards.push("No volcanic ash hazards");
        return `Volcanic Ash Severity: ${assessment.severity}. Operational Status: ${assessment.operationalStatus}. Hazards: ${hazards.join(", ")}.`;
    }
}
exports.VolcanicAshRules = VolcanicAshRules;
//# sourceMappingURL=volcanicAsh.rules.js.map