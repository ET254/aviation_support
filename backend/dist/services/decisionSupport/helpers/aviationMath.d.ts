export declare class AviationMath {
    static toRadians(degrees: number): number;
    static toDegrees(radians: number): number;
    static normalizeHeading(heading: number): number;
    static angleDifference(a: number, b: number): number;
    static calculateCrosswind(windDirection: number, windSpeed: number, runwayHeading: number): number;
    static calculateHeadwind(windDirection: number, windSpeed: number, runwayHeading: number): number;
    static calculateTailwind(windDirection: number, windSpeed: number, runwayHeading: number): number;
    static calculatePressureAltitude(elevationFeet: number, qnh: number): number;
    static calculateDensityAltitude(elevationFeet: number, temperature: number, qnh: number): number;
    static saturationVaporPressure(temperature: number): number;
    static calculateRelativeHumidity(temperature: number, dewPoint: number): number;
    static dewPointSpread(temperature: number, dewPoint: number): number;
    static celsiusToKelvin(temperature: number): number;
    static knotsToMetersPerSecond(knots: number): number;
    static metersPerSecondToKnots(ms: number): number;
    static nauticalMilesToKm(nm: number): number;
    static kmToNauticalMiles(km: number): number;
    static feetToMeters(feet: number): number;
    static metersToFeet(meters: number): number;
    static determineFlightCategory(visibility: number, cloudBase: number): "VFR" | "MVFR" | "IFR" | "LIFR";
    static clamp(value: number, min: number, max: number): number;
}
//# sourceMappingURL=aviationMath.d.ts.map