import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export interface DensityAltitudeAssessment {
    densityAltitude: number;
    pressureAltitude?: number;
    severity: "NONE" | "LOW" | "MODERATE" | "HIGH" | "EXTREME";
    score: number;
    operationalStatus: "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL";
    aircraftPerformanceReduction: number;
    takeoffPerformanceReduction: number;
    climbPerformanceReduction: number;
    landingPerformanceIncrease: number;
    pilotMessage: string;
    atcMessage: string;
    dispatcherMessage: string;
    airportMessage: string;
    recommendations: string[];
}
export declare class DensityAltitudeRules {
    static evaluate(wx: CanonicalWeatherObservation): DensityAltitudeAssessment;
    static calculateRiskScore(densityAltitude: number): number;
    static determineSeverity(score: number): "NONE" | "LOW" | "MODERATE" | "HIGH" | "EXTREME";
    static operationalStatus(score: number): "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL";
    static aircraftPerformanceReduction(densityAltitude: number): number;
    static takeoffPerformanceReduction(densityAltitude: number): number;
    static climbPerformanceReduction(densityAltitude: number): number;
    static landingPerformanceIncrease(densityAltitude: number): number;
    static pilotMessage(score: number): string;
    static atcMessage(score: number): string;
    static dispatcherMessage(score: number): string;
    static airportMessage(score: number): string;
    static recommendations(score: number): string[];
    static isHighElevationAirport(wx: CanonicalWeatherObservation): boolean;
    static isHotAndHigh(wx: CanonicalWeatherObservation): boolean;
    static obstacleClearanceRisk(wx: CanonicalWeatherObservation): "LOW" | "MODERATE" | "HIGH" | "EXTREME";
    static enginePerformanceReduction(densityAltitude: number): number;
    static suitableForCommercialOperations(wx: CanonicalWeatherObservation): boolean;
    static suitableForGeneralAviation(wx: CanonicalWeatherObservation): boolean;
    static summary(wx: CanonicalWeatherObservation): string;
}
//# sourceMappingURL=densityAltitude.rules.d.ts.map