import { WeatherData } from "@prisma/client";
import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export declare class VolcanicAshMapper {
    static map(weather: WeatherData, observation: CanonicalWeatherObservation): void;
    private static detectVolcanicAsh;
}
//# sourceMappingURL=volcanicAsh.mapper.d.ts.map