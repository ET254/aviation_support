"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherDecisionService = void 0;
const weatherDecisionEngine_1 = require("./weatherDecisionEngine");
class WeatherDecisionService {
    static evaluateObservation(observation) {
        return weatherDecisionEngine_1.WeatherDecisionEngine.evaluate(observation);
    }
    static evaluateBatch(observations) {
        return observations.map(observation => weatherDecisionEngine_1.WeatherDecisionEngine.evaluate(observation));
    }
    static highestRisk(observations) {
        if (observations.length === 0)
            return null;
        const decisions = this.evaluateBatch(observations);
        return decisions.reduce((highest, current) => current.overallRiskScore >
            highest.overallRiskScore
            ? current
            : highest);
    }
    static airportStatus(observation) {
        const decision = this.evaluateObservation(observation);
        return {
            station: observation.stationId,
            operationalStatus: decision.operationalStatus,
            severity: decision.overallSeverity,
            riskScore: decision.overallRiskScore
        };
    }
    static pilotBriefing(observation) {
        return this.evaluateObservation(observation).pilotRecommendations;
    }
    static atcBriefing(observation) {
        return this.evaluateObservation(observation).atcRecommendations;
    }
    static dispatcherBriefing(observation) {
        return this.evaluateObservation(observation).dispatcherRecommendations;
    }
    static airportBriefing(observation) {
        return this.evaluateObservation(observation).airportRecommendations;
    }
}
exports.WeatherDecisionService = WeatherDecisionService;
//# sourceMappingURL=weatherDecision.service.js.map