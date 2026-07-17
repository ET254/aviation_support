import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export interface PrecipitationAssessment {
    precipitationPresent: boolean;
    type: "NONE" | "RAIN" | "DRIZZLE" | "SNOW" | "SLEET" | "HAIL" | "FREEZING_RAIN" | "FREEZING_DRIZZLE" | "ICE_PELLETS";
    intensity: "NONE" | "LIGHT" | "MODERATE" | "HEAVY" | "VIOLENT";
    severity: "NONE" | "LIGHT" | "MODERATE" | "SEVERE" | "EXTREME";
    score: number;
    operationalStatus: "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL";
    pilotMessage: string;
    atcMessage: string;
    dispatcherMessage: string;
    airportMessage: string;
    recommendations: string[];
}
export declare class PrecipitationRules {
    static evaluate(wx: CanonicalWeatherObservation): PrecipitationAssessment;
    static calculateRiskScore(wx: CanonicalWeatherObservation): number;
    static hasPrecipitation(wx: CanonicalWeatherObservation): boolean;
    static determineSeverity(score: number): "NONE" | "LIGHT" | "MODERATE" | "SEVERE" | "EXTREME";
    static operationalStatus(score: number): "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL";
    static pilotMessage(score: number): string;
    static atcMessage(score: number): string;
    static dispatcherMessage(score: number): string;
    static airportMessage(score: number): string;
    static recommendations(score: number): string[];
    static hydroplaningRisk(wx: CanonicalWeatherObservation): "LOW" | "MODERATE" | "HIGH" | "EXTREME";
    static runwayContaminated(wx: CanonicalWeatherObservation): boolean;
    static estimatedBrakingAction(wx: CanonicalWeatherObservation): "GOOD" | "GOOD_TO_MEDIUM" | "MEDIUM" | "MEDIUM_TO_POOR" | "POOR";
    static hasHeavyRain(wx: CanonicalWeatherObservation): boolean;
    static hasFrozenPrecipitation(wx: CanonicalWeatherObservation): boolean;
    static suitableForCommercialOperations(wx: CanonicalWeatherObservation): boolean;
    static suitableForGeneralAviation(wx: CanonicalWeatherObservation): boolean;
    static summary(wx: CanonicalWeatherObservation): string;
}
//# sourceMappingURL=precipitation.rules.d.ts.map