import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export declare class DerivedValuesMapper {
    static map(observation: CanonicalWeatherObservation): void;
    private static calculateObservationAge;
    private static calculateRelativeHumidity;
    private static calculateDensityIndex;
    private static calculateConfidence;
    private static determineConfidenceLevel;
}
//# sourceMappingURL=derivedValues.mapper.d.ts.map