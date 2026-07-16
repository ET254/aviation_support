import { WeatherData } from "@prisma/client";
import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export declare class DensityAltitudeMapper {
    static map(weather: WeatherData, observation: CanonicalWeatherObservation): void;
    private static calculatePressureAltitude;
    private static calculateDensityAltitude;
    private static calculateDensityIndex;
    private static operationalReadiness;
}
//# sourceMappingURL=densityAltitude.mapper.d.ts.map