import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export interface TurbulenceAssessment {
    turbulencePresent: boolean;
    severity: "NONE" | "LIGHT" | "MODERATE" | "SEVERE" | "EXTREME";
    score: number;
    operationalStatus: "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL";
    clearAirTurbulence: boolean;
    mountainWave: boolean;
    rotorCloud: boolean;
    pilotMessage: string;
    atcMessage: string;
    dispatcherMessage: string;
    airportMessage: string;
    recommendations: string[];
}
export declare class TurbulenceRules {
    static evaluate(wx: CanonicalWeatherObservation): TurbulenceAssessment;
    static calculateRiskScore(wx: CanonicalWeatherObservation): number;
    static hasTurbulence(wx: CanonicalWeatherObservation): boolean;
    static determineSeverity(score: number): "NONE" | "LIGHT" | "MODERATE" | "SEVERE" | "EXTREME";
    static operationalStatus(score: number): "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL";
    static pilotMessage(score: number): string;
    static atcMessage(score: number): string;
    static dispatcherMessage(score: number): string;
    static airportMessage(score: number): string;
    static recommendations(score: number): string[];
    static hasClearAirTurbulence(wx: CanonicalWeatherObservation): boolean;
    static hasMechanicalTurbulence(wx: CanonicalWeatherObservation): boolean;
    static hasMountainWave(wx: CanonicalWeatherObservation): boolean;
    static hasRotorCloud(wx: CanonicalWeatherObservation): boolean;
    static hasConvectiveTurbulence(wx: CanonicalWeatherObservation): boolean;
    static hasLowLevelWindShear(wx: CanonicalWeatherObservation): boolean;
    static hasJetStreamTurbulence(wx: CanonicalWeatherObservation): boolean;
    static suitableForCommercialOperations(wx: CanonicalWeatherObservation): boolean;
    static suitableForGeneralAviation(wx: CanonicalWeatherObservation): boolean;
    static summary(wx: CanonicalWeatherObservation): string;
}
//# sourceMappingURL=turbulence.rules.d.ts.map