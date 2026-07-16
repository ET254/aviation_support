import { WeatherData } from "@prisma/client";
import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export declare class ThunderstormMapper {
    static map(weather: WeatherData, observation: CanonicalWeatherObservation): void;
    private static detectThunderstorm;
    private static detectLightning;
    private static detectHail;
    private static detectSquall;
    private static detectTornado;
    private static detectFunnelCloud;
}
//# sourceMappingURL=thunderstorm.mapper.d.ts.map