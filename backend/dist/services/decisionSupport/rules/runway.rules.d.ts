import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export interface RunwayAssessment {
    condition: string;
    brakingAction: string;
    frictionCoefficient?: number;
    contaminationPercent?: number;
    standingWater: boolean;
    snowDepth?: number;
    slushDepth?: number;
    score: number;
    severity: "NONE" | "LOW" | "MODERATE" | "HIGH" | "EXTREME";
    operationalStatus: "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL";
    pilotMessage: string;
    atcMessage: string;
    dispatcherMessage: string;
    airportMessage: string;
    recommendations: string[];
}
export declare class RunwayRules {
    static evaluate(wx: CanonicalWeatherObservation): RunwayAssessment;
    static calculateRiskScore(wx: CanonicalWeatherObservation): number;
    static determineSeverity(score: number): "NONE" | "LOW" | "MODERATE" | "HIGH" | "EXTREME";
    static operationalStatus(score: number): "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL";
    static pilotMessage(score: number): string;
    static atcMessage(score: number): string;
    static dispatcherMessage(score: number): string;
    static airportMessage(score: number): string;
    static recommendations(score: number): string[];
    static runwayUsable(wx: CanonicalWeatherObservation): boolean;
    static brakingAssessment(wx: CanonicalWeatherObservation): string;
    static frictionStatus(wx: CanonicalWeatherObservation): string;
    static hasStandingWater(wx: CanonicalWeatherObservation): boolean;
    static excessiveSnow(wx: CanonicalWeatherObservation): boolean;
    static excessiveSlush(wx: CanonicalWeatherObservation): boolean;
    static heavilyContaminated(wx: CanonicalWeatherObservation): boolean;
    static shouldCloseRunway(wx: CanonicalWeatherObservation): boolean;
    static suitableForCommercialAircraft(wx: CanonicalWeatherObservation): boolean;
    static suitableForGeneralAviation(wx: CanonicalWeatherObservation): boolean;
    static summary(wx: CanonicalWeatherObservation): string;
}
//# sourceMappingURL=runway.rules.d.ts.map