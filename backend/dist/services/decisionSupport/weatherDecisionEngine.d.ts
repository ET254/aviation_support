import { CanonicalWeatherObservation } from "../../models/weather/CanonicalWeatherObservation";
import { VisibilityRules } from "./rules/visibility.rules";
import { WindRules } from "./rules/wind.rules";
import { RunwayRules } from "./rules/runway.rules";
import { CloudRules } from "./rules/cloud.rules";
import { IcingRules } from "./rules/icing.rules";
import { TurbulenceRules } from "./rules/turbulence.rules";
import { ThunderstormRules } from "./rules/thunderstorm.rules";
import { PrecipitationRules } from "./rules/precipitation.rules";
import { DensityAltitudeRules } from "./rules/densityAltitude.rules";
import { VolcanicAshRules } from "./rules/volcanicAsh.rules";
import { PilotRecommendation } from "./recommendations/pilotRecommendations";
import { ATCRecommendation } from "./recommendations/atcRecommendations";
import { DispatcherRecommendation } from "./recommendations/dispatcherRecommendations";
import { AirportRecommendation } from "./recommendations/airportRecommendations";
export interface WeatherDecision {
    observation: CanonicalWeatherObservation;
    visibility: ReturnType<typeof VisibilityRules.evaluate>;
    wind: ReturnType<typeof WindRules.evaluate>;
    runway: ReturnType<typeof RunwayRules.evaluate>;
    clouds: ReturnType<typeof CloudRules.evaluate>;
    icing: ReturnType<typeof IcingRules.evaluate>;
    turbulence: ReturnType<typeof TurbulenceRules.evaluate>;
    thunderstorms: ReturnType<typeof ThunderstormRules.evaluate>;
    precipitation: ReturnType<typeof PrecipitationRules.evaluate>;
    densityAltitude: ReturnType<typeof DensityAltitudeRules.evaluate>;
    volcanicAsh: ReturnType<typeof VolcanicAshRules.evaluate>;
    overallRiskScore: number;
    overallSeverity: "NONE" | "LOW" | "MODERATE" | "HIGH" | "EXTREME";
    operationalStatus: "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL";
    pilotRecommendations: PilotRecommendation;
    atcRecommendations: ATCRecommendation;
    dispatcherRecommendations: DispatcherRecommendation;
    airportRecommendations: AirportRecommendation;
}
export declare class WeatherDecisionEngine {
    static evaluate(wx: CanonicalWeatherObservation): WeatherDecision;
    static calculateOverallRisk(scores: number[]): number;
    static determineSeverity(score: number): "NONE" | "LOW" | "MODERATE" | "HIGH" | "EXTREME";
    static operationalStatus(score: number): "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL";
}
//# sourceMappingURL=weatherDecisionEngine.d.ts.map