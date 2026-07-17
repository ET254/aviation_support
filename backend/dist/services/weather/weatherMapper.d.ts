import { WeatherData, Station } from "@prisma/client";
import { CanonicalWeatherObservation } from "../../models/weather/CanonicalWeatherObservation";
export declare class WeatherMapper {
    static map(weather: WeatherData, station: Station): CanonicalWeatherObservation;
}
//# sourceMappingURL=weatherMapper.d.ts.map