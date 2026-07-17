import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export interface CloudAssessment {
    ceiling?: number;
    cloudBase?: number;
    cloudAmount?: number;
    cloudType?: string;
    flightCategory: "VFR" | "MVFR" | "IFR" | "LIFR";
    score: number;
    severity: "NONE" | "LOW" | "MODERATE" | "HIGH" | "EXTREME";
    operationalStatus: "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL";
    pilotMessage: string;
    atcMessage: string;
    dispatcherMessage: string;
    airportMessage: string;
    recommendations: string[];
}
export declare class CloudRules {
    static evaluate(wx: CanonicalWeatherObservation): CloudAssessment;
    static calculateRiskScore(wx: CanonicalWeatherObservation): number;
    static flightCategory(wx: CanonicalWeatherObservation): "VFR" | "MVFR" | "IFR" | "LIFR";
    static determineSeverity(score: number): "NONE" | "LOW" | "MODERATE" | "HIGH" | "EXTREME";
    static operationalStatus(score: number): "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL";
    static pilotMessage(score: number): string;
    static atcMessage(score: number): string;
    static dispatcherMessage(score: number): string;
    static airportMessage(score: number): string;
    static recommendations(score: number): string[];
    static hasLowCeiling(wx: CanonicalWeatherObservation): boolean;
    static hasCeiling(wx: CanonicalWeatherObservation): boolean;
    static hasCumulonimbus(wx: CanonicalWeatherObservation): boolean;
    static hasToweringCumulus(wx: CanonicalWeatherObservation): boolean;
    static hasConvectiveClouds(wx: CanonicalWeatherObservation): boolean;
    static suitableForVFR(wx: CanonicalWeatherObservation): boolean;
    static suitableForIFR(wx: CanonicalWeatherObservation): boolean;
    static suitableForCommercialOperations(wx: CanonicalWeatherObservation): boolean;
    static suitableForGeneralAviation(wx: CanonicalWeatherObservation): boolean;
    static summary(wx: CanonicalWeatherObservation): string;
}
//# sourceMappingURL=cloud.rules.d.ts.map