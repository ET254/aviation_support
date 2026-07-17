import { WeatherData } from "@prisma/client";
import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export declare class RunwayMapper {
    static map(weather: WeatherData, observation: CanonicalWeatherObservation): void;
    private static determineRunwayCondition;
    private static calculateContamination;
    private static calculateFriction;
    private static determineBrakingAction;
    private static hasStandingWater;
}
//# sourceMappingURL=runway.mapper.d.ts.map