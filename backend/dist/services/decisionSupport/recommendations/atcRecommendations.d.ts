import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export interface ATCRecommendation {
    airportStatus: "OPEN" | "LIMITED" | "RESTRICTED" | "CLOSED";
    trafficFlow: "NORMAL" | "REDUCED" | "HOLDING" | "SUSPENDED";
    runwayStatus: "AVAILABLE" | "CAUTION" | "RESTRICTED" | "CLOSED";
    separation: "NORMAL" | "INCREASED" | "MAXIMUM";
    lowVisibilityProcedures: boolean;
    arrivalRestrictions: boolean;
    departureRestrictions: boolean;
    holdingRequired: boolean;
    groundStopRecommended: boolean;
    runwayInspectionRequired: boolean;
    summary: string;
    hazards: string[];
    recommendations: string[];
}
export declare class ATCRecommendations {
    static generate(wx: CanonicalWeatherObservation): ATCRecommendation;
}
//# sourceMappingURL=atcRecommendations.d.ts.map