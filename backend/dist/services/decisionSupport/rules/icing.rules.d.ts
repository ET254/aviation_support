import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export interface IcingAssessment {
    icingPresent: boolean;
    severity: "NONE" | "LIGHT" | "MODERATE" | "SEVERE" | "EXTREME";
    score: number;
    operationalStatus: "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL";
    freezingLevel?: number;
    supercooledLiquidWater: boolean;
    freezingRain: boolean;
    freezingDrizzle: boolean;
    pilotMessage: string;
    atcMessage: string;
    dispatcherMessage: string;
    airportMessage: string;
    recommendations: string[];
}
export declare class IcingRules {
    static evaluate(wx: CanonicalWeatherObservation): IcingAssessment;
    static calculateRiskScore(wx: CanonicalWeatherObservation): number;
    static hasIcing(wx: CanonicalWeatherObservation): boolean;
    static determineSeverity(score: number): "NONE" | "LIGHT" | "MODERATE" | "SEVERE" | "EXTREME";
    static operationalStatus(score: number): "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL";
    static pilotMessage(score: number): string;
    static atcMessage(score: number): string;
    static dispatcherMessage(score: number): string;
    static airportMessage(score: number): string;
    static recommendations(score: number): string[];
    static hasAirframeIcing(wx: CanonicalWeatherObservation): boolean;
    static hasEngineIcing(wx: CanonicalWeatherObservation): boolean;
    static carburetorIcingRisk(wx: CanonicalWeatherObservation): "LOW" | "MODERATE" | "HIGH" | "SEVERE";
    static hasSupercooledLiquidWater(wx: CanonicalWeatherObservation): boolean;
    static lowFreezingLevel(wx: CanonicalWeatherObservation): boolean;
    static requiresDeicing(wx: CanonicalWeatherObservation): boolean;
    static suitableForCommercialOperations(wx: CanonicalWeatherObservation): boolean;
    static suitableForGeneralAviation(wx: CanonicalWeatherObservation): boolean;
    static summary(wx: CanonicalWeatherObservation): string;
}
//# sourceMappingURL=icing.rules.d.ts.map