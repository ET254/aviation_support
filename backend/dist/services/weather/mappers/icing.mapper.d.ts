import { WeatherData } from "@prisma/client";
import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export declare class IcingMapper {
    static map(weather: WeatherData, observation: CanonicalWeatherObservation): void;
    private static detectIcing;
    private static determineSeverity;
    private static determineBase;
    private static determineTop;
    private static detectSLW;
    private static detectFreezingRain;
    private static detectFreezingDrizzle;
}
//# sourceMappingURL=icing.mapper.d.ts.map