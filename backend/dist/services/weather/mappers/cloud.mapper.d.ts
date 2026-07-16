import { WeatherData } from "@prisma/client";
import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export declare class CloudMapper {
    static map(weather: WeatherData, observation: CanonicalWeatherObservation): void;
    private static mapCloudType;
    private static buildLayers;
    private static layerType;
    private static calculateCeiling;
    private static isConvective;
}
//# sourceMappingURL=cloud.mapper.d.ts.map