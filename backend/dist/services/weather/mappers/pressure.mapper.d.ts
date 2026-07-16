import { WeatherData } from "@prisma/client";
import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export declare class PressureMapper {
    static map(weather: WeatherData, observation: Partial<CanonicalWeatherObservation>): void;
    private static qnhToAltimeter;
}
//# sourceMappingURL=pressure.mapper.d.ts.map