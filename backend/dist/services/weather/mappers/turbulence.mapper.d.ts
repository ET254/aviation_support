import { WeatherData } from "@prisma/client";
import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export declare class TurbulenceMapper {
    static map(weather: WeatherData, observation: CanonicalWeatherObservation): void;
    private static detectTurbulence;
    private static determineSeverity;
    private static estimateBase;
    private static estimateTop;
    private static detectCAT;
    private static detectMountainWave;
}
//# sourceMappingURL=turbulence.mapper.d.ts.map