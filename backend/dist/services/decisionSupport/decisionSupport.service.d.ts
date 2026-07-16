import { CanonicalWeatherObservation } from "../../models/weather/CanonicalWeatherObservation";
import { RiskAssessment } from "../riskAssessment.service";
import { OperationalImpact } from "../impactAssessment.service";
import { WeatherDecision } from "./weatherDecisionEngine";
export declare enum AviationDecision {
    GO = "GO",
    GO_WITH_CAUTION = "GO_WITH_CAUTION",
    DELAY = "DELAY",
    HOLD = "HOLD",
    DIVERT = "DIVERT",
    CANCEL = "CANCEL"
}
export declare enum OperationalStatus {
    NORMAL = "NORMAL",
    MONITOR = "MONITOR",
    CAUTION = "CAUTION",
    RESTRICTED = "RESTRICTED",
    SUSPENDED = "SUSPENDED",
    CLOSED = "CLOSED"
}
export declare enum DecisionColour {
    GREEN = "GREEN",
    YELLOW = "YELLOW",
    ORANGE = "ORANGE",
    RED = "RED"
}
export interface UserRecommendations {
    pilots: string[];
    atc: string[];
    dispatch: string[];
    meteorologists: string[];
    airportOperations: string[];
    maintenance: string[];
}
export interface DecisionSupportResult {
    decision: AviationDecision;
    status: OperationalStatus;
    colour: DecisionColour;
    confidence: number;
    overallRiskScore: number;
    summary: string;
    recommendations: UserRecommendations;
    impacts: OperationalImpact;
    risk: RiskAssessment;
    weatherDecision: WeatherDecision;
    evaluatedAt: Date;
}
export declare class DecisionSupportService {
    static evaluateDecision(weather: CanonicalWeatherObservation, risk: RiskAssessment): DecisionSupportResult;
    private static calculateOverallRisk;
    private static determineDecision;
    private static determineOperationalStatus;
    private static determineColour;
    private static evaluateVisibility;
    private static evaluateWind;
    private static evaluateCrosswind;
    private static evaluateCloud;
    private static evaluateDensityAltitude;
    private static evaluateRiskAssessment;
    private static calculateConfidence;
    private static generateRecommendations;
    private static generateSummary;
}
//# sourceMappingURL=decisionSupport.service.d.ts.map