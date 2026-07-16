import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export interface ThunderstormAssessment {
    thunderstormPresent: boolean;
    severity: "NONE" | "LIGHT" | "MODERATE" | "SEVERE" | "EXTREME";
    score: number;
    operationalStatus: "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL";
    lightning: boolean;
    hail: boolean;
    tornado: boolean;
    funnelCloud: boolean;
    squall: boolean;
    pilotMessage: string;
    atcMessage: string;
    dispatcherMessage: string;
    airportMessage: string;
    recommendations: string[];
}
export declare class ThunderstormRules {
    static evaluate(wx: CanonicalWeatherObservation): ThunderstormAssessment;
    static calculateRiskScore(wx: CanonicalWeatherObservation): number;
    static hasThunderstorm(wx: CanonicalWeatherObservation): boolean;
    static determineSeverity(score: number): "NONE" | "LIGHT" | "MODERATE" | "SEVERE" | "EXTREME";
    static operationalStatus(score: number): "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL";
    static pilotMessage(score: number): string;
    static atcMessage(score: number): string;
    static dispatcherMessage(score: number): string;
    static airportMessage(score: number): string;
    static recommendations(score: number): string[];
    static hasLightning(wx: CanonicalWeatherObservation): boolean;
    static hasHail(wx: CanonicalWeatherObservation): boolean;
    static hasTornado(wx: CanonicalWeatherObservation): boolean;
    static hasFunnelCloud(wx: CanonicalWeatherObservation): boolean;
    static hasSquall(wx: CanonicalWeatherObservation): boolean;
    static hasMicroburst(wx: CanonicalWeatherObservation): boolean;
    static hasDownburst(wx: CanonicalWeatherObservation): boolean;
    static hasConvectiveWeather(wx: CanonicalWeatherObservation): boolean;
    static groundOperationsAllowed(wx: CanonicalWeatherObservation): boolean;
    static suitableForCommercialOperations(wx: CanonicalWeatherObservation): boolean;
    static suitableForGeneralAviation(wx: CanonicalWeatherObservation): boolean;
    static summary(wx: CanonicalWeatherObservation): string;
}
//# sourceMappingURL=thunderstorm.rules.d.ts.map