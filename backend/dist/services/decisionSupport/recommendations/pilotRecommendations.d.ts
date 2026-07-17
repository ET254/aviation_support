import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export interface PilotRecommendation {
    overallStatus: "GO" | "GO_WITH_CAUTION" | "DELAY" | "DIVERT" | "NO_GO";
    overallRisk: "LOW" | "MODERATE" | "HIGH" | "EXTREME";
    summary: string;
    recommendations: string[];
    hazards: string[];
    requiredActions: string[];
}
export declare class PilotRecommendations {
    static generate(wx: CanonicalWeatherObservation): PilotRecommendation;
}
//# sourceMappingURL=pilotRecommendations.d.ts.map