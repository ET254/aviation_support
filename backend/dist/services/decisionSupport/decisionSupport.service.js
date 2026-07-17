"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionSupportService = exports.DecisionColour = exports.OperationalStatus = exports.AviationDecision = void 0;
const impactAssessment_service_1 = require("../impactAssessment.service");
const weatherDecisionEngine_1 = require("./weatherDecisionEngine");
var AviationDecision;
(function (AviationDecision) {
    AviationDecision["GO"] = "GO";
    AviationDecision["GO_WITH_CAUTION"] = "GO_WITH_CAUTION";
    AviationDecision["DELAY"] = "DELAY";
    AviationDecision["HOLD"] = "HOLD";
    AviationDecision["DIVERT"] = "DIVERT";
    AviationDecision["CANCEL"] = "CANCEL";
})(AviationDecision || (exports.AviationDecision = AviationDecision = {}));
var OperationalStatus;
(function (OperationalStatus) {
    OperationalStatus["NORMAL"] = "NORMAL";
    OperationalStatus["MONITOR"] = "MONITOR";
    OperationalStatus["CAUTION"] = "CAUTION";
    OperationalStatus["RESTRICTED"] = "RESTRICTED";
    OperationalStatus["SUSPENDED"] = "SUSPENDED";
    OperationalStatus["CLOSED"] = "CLOSED";
})(OperationalStatus || (exports.OperationalStatus = OperationalStatus = {}));
var DecisionColour;
(function (DecisionColour) {
    DecisionColour["GREEN"] = "GREEN";
    DecisionColour["YELLOW"] = "YELLOW";
    DecisionColour["ORANGE"] = "ORANGE";
    DecisionColour["RED"] = "RED";
})(DecisionColour || (exports.DecisionColour = DecisionColour = {}));
class DecisionSupportService {
    static evaluateDecision(weather, risk) {
        const impacts = impactAssessment_service_1.ImpactAssessmentService.assess(weather, risk);
        const weatherDecision = weatherDecisionEngine_1.WeatherDecisionEngine.evaluate(weather);
        const scores = [];
        scores.push(this.evaluateVisibility(weather));
        scores.push(this.evaluateWind(weather));
        scores.push(this.evaluateCrosswind(weather));
        scores.push(this.evaluateCloud(weather));
        scores.push(this.evaluateDensityAltitude(weather));
        scores.push(this.evaluateRiskAssessment(risk));
        const overallRiskScore = this.calculateOverallRisk(scores);
        const decision = this.determineDecision(overallRiskScore);
        const status = this.determineOperationalStatus(overallRiskScore);
        const colour = this.determineColour(overallRiskScore);
        const confidence = this.calculateConfidence(weather, risk);
        const recommendations = this.generateRecommendations(impacts);
        const summary = this.generateSummary(decision, overallRiskScore, scores);
        return {
            decision,
            status,
            colour,
            confidence,
            overallRiskScore,
            summary,
            recommendations,
            impacts,
            risk,
            weatherDecision,
            evaluatedAt: new Date()
        };
    }
    static calculateOverallRisk(scores) {
        if (scores.length === 0)
            return 0;
        const total = scores.reduce((sum, s) => sum + s.score, 0);
        return Math.round(total / scores.length);
    }
    static determineDecision(score) {
        if (score < 20)
            return AviationDecision.GO;
        if (score < 40)
            return AviationDecision.GO_WITH_CAUTION;
        if (score < 60)
            return AviationDecision.DELAY;
        if (score < 80)
            return AviationDecision.HOLD;
        if (score < 90)
            return AviationDecision.DIVERT;
        return AviationDecision.CANCEL;
    }
    static determineOperationalStatus(score) {
        if (score < 20)
            return OperationalStatus.NORMAL;
        if (score < 40)
            return OperationalStatus.MONITOR;
        if (score < 60)
            return OperationalStatus.CAUTION;
        if (score < 80)
            return OperationalStatus.RESTRICTED;
        if (score < 95)
            return OperationalStatus.SUSPENDED;
        return OperationalStatus.CLOSED;
    }
    static determineColour(score) {
        if (score < 25)
            return DecisionColour.GREEN;
        if (score < 50)
            return DecisionColour.YELLOW;
        if (score < 75)
            return DecisionColour.ORANGE;
        return DecisionColour.RED;
    }
    static evaluateVisibility(weather) {
        const visibility = Number(weather.visibility ?? 99999);
        if (visibility < 800) {
            return { score: 95, reason: 'Visibility below CAT II minima.' };
        }
        if (visibility < 3000) {
            return { score: 70, reason: 'Visibility reduced below normal operating minima.' };
        }
        if (visibility < 5000) {
            return { score: 35, reason: 'Visibility is reduced but still manageable.' };
        }
        return { score: 5, reason: 'Visibility is good for normal operations.' };
    }
    static evaluateWind(weather) {
        const windSpeed = Number(weather.windSpeed ?? 0);
        if (windSpeed >= 40) {
            return { score: 90, reason: 'Surface winds are severe.' };
        }
        if (windSpeed >= 25) {
            return { score: 65, reason: 'Surface winds are strong.' };
        }
        if (windSpeed >= 15) {
            return { score: 30, reason: 'Surface winds require monitoring.' };
        }
        return { score: 5, reason: 'Surface winds are within expected limits.' };
    }
    static evaluateCrosswind(weather) {
        const crosswind = Math.abs(Number(weather.crosswindComponent ?? 0));
        if (crosswind >= 30) {
            return { score: 90, reason: 'Crosswind exceeds runway operational limits.' };
        }
        if (crosswind >= 20) {
            return { score: 65, reason: 'Crosswind is high for some aircraft types.' };
        }
        if (crosswind >= 10) {
            return { score: 25, reason: 'Crosswind requires attention.' };
        }
        return { score: 5, reason: 'Crosswind is acceptable.' };
    }
    static evaluateCloud(weather) {
        const cloudBase = Number(weather.cloudBase ?? 99999);
        if (cloudBase < 300) {
            return { score: 92, reason: 'Cloud ceiling is critically low.' };
        }
        if (cloudBase < 800) {
            return { score: 70, reason: 'Low cloud base threatens instrument minima.' };
        }
        if (cloudBase < 1500) {
            return { score: 35, reason: 'Cloud base is reduced.' };
        }
        return { score: 8, reason: 'Cloud base is comfortable for normal operations.' };
    }
    static evaluateDensityAltitude(weather) {
        const densityAltitude = Number(weather.densityAltitude ?? 0);
        if (densityAltitude >= 9000) {
            return { score: 88, reason: 'Density altitude is very high and reduces performance.' };
        }
        if (densityAltitude >= 7000) {
            return { score: 55, reason: 'Density altitude is elevated.' };
        }
        if (densityAltitude >= 5000) {
            return { score: 25, reason: 'Density altitude is moderate.' };
        }
        return { score: 5, reason: 'Density altitude is within normal limits.' };
    }
    static evaluateRiskAssessment(risk) {
        const severityScore = {
            LOW: 15,
            MEDIUM: 35,
            HIGH: 60,
            EXTREME: 85,
        }[risk.overallRisk] ?? 20;
        return { score: severityScore, reason: risk.recommendation };
    }
    static calculateConfidence(weather, risk) {
        const baseConfidence = 0.75;
        const visibilityConfidence = weather.visibility ? 0.1 : 0;
        const windConfidence = weather.windSpeed ? 0.08 : 0;
        const riskConfidence = risk.overallRisk ? 0.07 : 0;
        return Math.min(0.99, baseConfidence + visibilityConfidence + windConfidence + riskConfidence);
    }
    static generateRecommendations(impacts) {
        return {
            pilots: impacts.pilots.slice(0, 3),
            atc: impacts.atc.slice(0, 3),
            dispatch: impacts.dispatch.slice(0, 3),
            meteorologists: impacts.meteorologists.slice(0, 3),
            airportOperations: impacts.airportOperations.slice(0, 3),
            maintenance: impacts.maintenance.slice(0, 3),
        };
    }
    static generateSummary(decision, score, reasons) {
        const keyReason = reasons.sort((a, b) => b.score - a.score)[0]?.reason ?? 'Conditions are being monitored.';
        return `operational decision ${decision} with an overall risk score of ${score}. ${keyReason}`;
    }
}
exports.DecisionSupportService = DecisionSupportService;
//# sourceMappingURL=decisionSupport.service.js.map