import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export interface AirportRecommendation {
    airportStatus: "NORMAL" | "LIMITED" | "RESTRICTED" | "CLOSED";
    runwayOperations: boolean;
    apronOperations: boolean;
    terminalOperations: boolean;
    maintenanceRequired: boolean;
    emergencyStandby: boolean;
    wildlifeInspectionRequired: boolean;
    deicingOperationsRequired: boolean;
    notamRequired: boolean;
    summary: string;
    hazards: string[];
    recommendations: string[];
}
export declare class AirportRecommendations {
    static generate(wx: CanonicalWeatherObservation): AirportRecommendation;
}
//# sourceMappingURL=airportRecommendations.d.ts.map