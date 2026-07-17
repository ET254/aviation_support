import { CanonicalWeatherObservation, FlightCategory } from "../../../models/weather/CanonicalWeatherObservation";
export interface VisibilityAssessment {
    visibility: number;
    category: FlightCategory;
    severity: "NONE" | "LOW" | "MODERATE" | "HIGH" | "EXTREME";
    score: number;
    operationalStatus: "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL";
    colour: string;
    pilotMessage: string;
    atcMessage: string;
    dispatcherMessage: string;
    airportMessage: string;
    recommendations: string[];
}
export declare class VisibilityRules {
    static evaluate(wx: CanonicalWeatherObservation): VisibilityAssessment;
    static determineFlightCategory(visibility: number): FlightCategory;
    static determineSeverity(visibility: number): "NONE" | "LOW" | "MODERATE" | "HIGH" | "EXTREME";
    static calculateRiskScore(visibility: number): number;
    static operationalStatus(score: number): "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL";
    static colour(score: number): string;
    static pilotMessage(category: FlightCategory): string;
    static atcMessage(category: FlightCategory): string;
    static dispatcherMessage(category: FlightCategory): string;
    static airportMessage(category: FlightCategory): string;
    static recommendations(category: FlightCategory): string[];
    static isLowVisibility(wx: CanonicalWeatherObservation): boolean;
    static isVeryLowVisibility(wx: CanonicalWeatherObservation): boolean;
    static isBelowCATI(wx: CanonicalWeatherObservation): boolean;
    static isBelowCATII(wx: CanonicalWeatherObservation): boolean;
    static isBelowCATIII(wx: CanonicalWeatherObservation): boolean;
    static requiresLVP(wx: CanonicalWeatherObservation): boolean;
    static canOperateVFR(wx: CanonicalWeatherObservation): boolean;
    static canOperateIFR(wx: CanonicalWeatherObservation): boolean;
    static isAirportClosedByVisibility(wx: CanonicalWeatherObservation): boolean;
    static trend(previousVisibility: number, currentVisibility: number): "IMPROVING" | "STEADY" | "DETERIORATING";
    static summary(wx: CanonicalWeatherObservation): string;
}
//# sourceMappingURL=visibility.rules.d.ts.map