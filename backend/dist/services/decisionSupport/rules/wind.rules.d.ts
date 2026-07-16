import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export interface WindAssessment {
    windDirection: number;
    windSpeed: number;
    gust?: number;
    crosswind: number;
    headwind: number;
    tailwind: number;
    severity: "NONE" | "LOW" | "MODERATE" | "HIGH" | "EXTREME";
    score: number;
    operationalStatus: "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL";
    runwayRecommendation: string;
    pilotMessage: string;
    atcMessage: string;
    dispatcherMessage: string;
    airportMessage: string;
    recommendations: string[];
}
export declare class WindRules {
    static evaluate(wx: CanonicalWeatherObservation): WindAssessment;
    static calculateRiskScore(windSpeed: number, crosswind: number, gust?: number): number;
    static determineSeverity(score: number): "NONE" | "LOW" | "MODERATE" | "HIGH" | "EXTREME";
    static operationalStatus(score: number): "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL";
    static runwayRecommendation(wx: CanonicalWeatherObservation): string;
    static pilotMessage(score: number): string;
    static atcMessage(score: number): string;
    static dispatcherMessage(score: number): string;
    static airportMessage(score: number): string;
    static recommendations(score: number): string[];
    static hasWindShear(wx: CanonicalWeatherObservation): boolean;
    static hasDangerousGusts(wx: CanonicalWeatherObservation): boolean;
    static exceedsCrosswindLimit(wx: CanonicalWeatherObservation, limit: number): boolean;
    static exceedsTailwindLimit(wx: CanonicalWeatherObservation, limit?: number): boolean;
    static hasStrongHeadwind(wx: CanonicalWeatherObservation): boolean;
    static suitableForLightAircraft(wx: CanonicalWeatherObservation): boolean;
    static suitableForCommercialAircraft(wx: CanonicalWeatherObservation): boolean;
    static suitableForGeneralAviation(wx: CanonicalWeatherObservation): boolean;
    static runwaySuitable(wx: CanonicalWeatherObservation): boolean;
    static trend(previousWind: number, currentWind: number): "INCREASING" | "STEADY" | "DECREASING";
    static directionChangedSignificantly(previousDirection: number, currentDirection: number): boolean;
    static summary(wx: CanonicalWeatherObservation): string;
}
//# sourceMappingURL=wind.rules.d.ts.map