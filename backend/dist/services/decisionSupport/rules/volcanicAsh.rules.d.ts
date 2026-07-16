import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export interface VolcanicAshAssessment {
    volcanicAshPresent: boolean;
    severity: "NONE" | "LOW" | "MODERATE" | "HIGH" | "EXTREME";
    score: number;
    operationalStatus: "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL";
    pilotMessage: string;
    atcMessage: string;
    dispatcherMessage: string;
    airportMessage: string;
    recommendations: string[];
}
export declare class VolcanicAshRules {
    static evaluate(wx: CanonicalWeatherObservation): VolcanicAshAssessment;
    static calculateRiskScore(wx: CanonicalWeatherObservation): number;
    static hasVolcanicAsh(wx: CanonicalWeatherObservation): boolean;
    static determineSeverity(score: number): "NONE" | "LOW" | "MODERATE" | "HIGH" | "EXTREME";
    static operationalStatus(score: number): "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL";
    static pilotMessage(score: number): string;
    static atcMessage(score: number): string;
    static dispatcherMessage(score: number): string;
    static airportMessage(score: number): string;
    static recommendations(score: number): string[];
    static ashCloudEncounter(wx: CanonicalWeatherObservation): boolean;
    static engineDamageRisk(wx: CanonicalWeatherObservation): "LOW" | "MODERATE" | "HIGH" | "EXTREME";
    static windscreenContaminationRisk(wx: CanonicalWeatherObservation): boolean;
    static pitotStaticContaminationRisk(wx: CanonicalWeatherObservation): boolean;
    static recommendAirspaceClosure(wx: CanonicalWeatherObservation): boolean;
    static suitableForCommercialOperations(wx: CanonicalWeatherObservation): boolean;
    static suitableForGeneralAviation(wx: CanonicalWeatherObservation): boolean;
    static summary(wx: CanonicalWeatherObservation): string;
}
//# sourceMappingURL=volcanicAsh.rules.d.ts.map