import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export interface RiskBreakdown {
    visibility: number;
    wind: number;
    runway: number;
    cloud: number;
    precipitation: number;
    icing: number;
    turbulence: number;
    thunderstorm: number;
    volcanicAsh: number;
    densityAltitude: number;
    total: number;
    category: "LOW" | "MODERATE" | "HIGH" | "EXTREME";
}
export declare class RiskScore {
    static calculate(wx: CanonicalWeatherObservation): RiskBreakdown;
    static visibilityRisk(visibility?: number): number;
    static windRisk(windSpeed?: number, crosswind?: number, gust?: number): number;
    static runwayRisk(condition?: string): number;
    static cloudRisk(cloudBase?: number, cloudAmount?: number): number;
    static precipitationRisk(type?: string, intensity?: "NONE" | "LIGHT" | "MODERATE" | "HEAVY" | "VIOLENT"): number;
    static icingRisk(wx: CanonicalWeatherObservation): number;
    static turbulenceRisk(wx: CanonicalWeatherObservation): number;
    static thunderstormRisk(wx: CanonicalWeatherObservation): number;
    static volcanicAshRisk(wx: CanonicalWeatherObservation): number;
    static densityAltitudeRisk(densityAltitude?: number): number;
    static category(score: number): RiskBreakdown["category"];
}
//# sourceMappingURL=riskScore.d.ts.map