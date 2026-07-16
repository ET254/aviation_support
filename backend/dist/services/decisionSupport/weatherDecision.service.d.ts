import { CanonicalWeatherObservation } from "../../models/weather/CanonicalWeatherObservation";
import { WeatherDecision } from "./weatherDecisionEngine";
export declare class WeatherDecisionService {
    static evaluateObservation(observation: CanonicalWeatherObservation): WeatherDecision;
    static evaluateBatch(observations: CanonicalWeatherObservation[]): WeatherDecision[];
    static highestRisk(observations: CanonicalWeatherObservation[]): WeatherDecision | null;
    static airportStatus(observation: CanonicalWeatherObservation): {
        station: string;
        operationalStatus: "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL";
        severity: "NONE" | "MODERATE" | "HIGH" | "LOW" | "EXTREME";
        riskScore: number;
    };
    static pilotBriefing(observation: CanonicalWeatherObservation): import("./recommendations/pilotRecommendations").PilotRecommendation;
    static atcBriefing(observation: CanonicalWeatherObservation): import("./recommendations/atcRecommendations").ATCRecommendation;
    static dispatcherBriefing(observation: CanonicalWeatherObservation): import("./recommendations/dispatcherRecommendations").DispatcherRecommendation;
    static airportBriefing(observation: CanonicalWeatherObservation): import("./recommendations/airportRecommendations").AirportRecommendation;
}
//# sourceMappingURL=weatherDecision.service.d.ts.map