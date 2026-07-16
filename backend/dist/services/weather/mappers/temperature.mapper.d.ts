import { WeatherData } from "@prisma/client";
import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export declare class TemperatureMapper {
    static map(weather: WeatherData, observation: Partial<CanonicalWeatherObservation>): void;
    private static calculateRelativeHumidity;
    private static calculateWetBulbTemperature;
    private static calculateDensityAltitude;
    private static calculateHeatIndex;
    private static calculateWindChill;
    private static calculateFreezingLevel;
}
//# sourceMappingURL=temperature.mapper.d.ts.map