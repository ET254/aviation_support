import { WeatherData } from "@prisma/client";
import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export declare class VisibilityMapper {
    static map(weather: WeatherData, observation: CanonicalWeatherObservation): void;
    private static determineFlightCategory;
}
//# sourceMappingURL=visibility.mapper.d.ts.map