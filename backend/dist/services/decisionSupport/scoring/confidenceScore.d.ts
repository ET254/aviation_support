import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export interface ConfidenceBreakdown {
    overall: number;
    category: "VERY_LOW" | "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
    source: number;
    completeness: number;
    freshness: number;
    quality: number;
    consistency: number;
    forecast: number;
    remarks: string[];
}
export declare class ConfidenceScore {
    static calculate(wx: CanonicalWeatherObservation): ConfidenceBreakdown;
    private static sourceConfidence;
    private static completenessConfidence;
    private static freshnessConfidence;
    private static qualityConfidence;
    private static consistencyConfidence;
    private static forecastConfidence;
    private static category;
    static describe(score: number): string;
    static isOperationallyReliable(confidence: ConfidenceBreakdown): boolean;
    static requiresVerification(confidence: ConfidenceBreakdown): boolean;
    static dashboardColour(confidence: number): string;
    static badge(confidence: number): string;
}
//# sourceMappingURL=confidenceScore.d.ts.map