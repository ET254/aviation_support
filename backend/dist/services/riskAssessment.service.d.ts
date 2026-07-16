export type FlightCategory = "VFR" | "MVFR" | "IFR" | "LIFR";
export type OverallRisk = "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
export interface RiskAssessment {
    overallRisk: OverallRisk;
    flightCategory: FlightCategory;
    visibilityRisk: string;
    ceilingRisk: string;
    windRisk: string;
    crosswindRisk: string;
    turbulenceRisk: string;
    icingRisk: string;
    thunderstormRisk: string;
    densityAltitudeRisk: string;
    recommendation: string;
    warnings: string[];
}
export declare class RiskAssessmentService {
    static assess(weather: any): RiskAssessment;
    private static determineFlightCategory;
    private static determineOverallRisk;
    private static evaluateVisibility;
    private static evaluateCeiling;
    private static evaluateWind;
    private static evaluateCrosswind;
    private static evaluateTurbulence;
    private static evaluateIcing;
    private static evaluateThunderstorm;
    private static evaluateDensityAltitude;
    private static getRecommendation;
}
//# sourceMappingURL=riskAssessment.service.d.ts.map