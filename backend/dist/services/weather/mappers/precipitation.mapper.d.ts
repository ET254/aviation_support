import { WeatherData } from "@prisma/client";
import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export declare class PrecipitationMapper {
    static map(weather: WeatherData, observation: CanonicalWeatherObservation): void;
    private static mapType;
    private static mapIntensity;
}
//# sourceMappingURL=precipitation.mapper.d.ts.map