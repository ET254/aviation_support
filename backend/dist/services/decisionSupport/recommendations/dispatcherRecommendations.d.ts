import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export interface DispatcherRecommendation {
    dispatchStatus: "RELEASE" | "RELEASE_WITH_RESTRICTIONS" | "DELAY" | "DIVERT" | "CANCEL";
    operationalRisk: "LOW" | "MODERATE" | "HIGH" | "EXTREME";
    alternateRequired: boolean;
    additionalFuelRequired: boolean;
    payloadRestriction: boolean;
    routeModificationRequired: boolean;
    deicingRequired: boolean;
    cancellationRecommended: boolean;
    delayRecommended: boolean;
    summary: string;
    hazards: string[];
    recommendations: string[];
}
export declare class DispatcherRecommendations {
    static generate(wx: CanonicalWeatherObservation): DispatcherRecommendation;
}
//# sourceMappingURL=dispatcherRecommendations.d.ts.map