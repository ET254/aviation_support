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
        throw new Error("Implemented in Part 2");
    }
    static evaluateWind(weather) {
        throw new Error("Implemented in Part 2");
    }
    static evaluateCrosswind(weather) {
        throw new Error("Implemented in Part 2");
    }
    static evaluateCloud(weather) {
        throw new Error("Implemented in Part 2");
    }
    static evaluateDensityAltitude(weather) {
        throw new Error("Implemented in Part 3");
    }
    static evaluateRiskAssessment(risk) {
        throw new Error("Implemented in Part 3");
    }
    static calculateConfidence(weather, risk) {
        throw new Error("Implemented in Part 4");
    }
    static generateRecommendations(impacts) {
        throw new Error("Implemented in Part 4");
    }
    static generateSummary(decision, score, reasons) {
        throw new Error("Implemented in Part 4");
    }
}
exports.DecisionSupportService = DecisionSupportService;
//# sourceMappingURL=decisionSupport.service.js.map