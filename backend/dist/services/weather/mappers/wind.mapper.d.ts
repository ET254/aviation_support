import { WeatherData, Station } from "@prisma/client";
import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export declare class WindMapper {
    static map(weather: WeatherData & {
        station?: Station;
    }, observation: CanonicalWeatherObservation): void;
    private static calculateCrosswind;
    private static calculateHeadwind;
    private static calculateTailwind;
    private static detectWindShear;
    private static toRadians;
    private static normalizeAngle;
}
//# sourceMappingURL=wind.mapper.d.ts.map