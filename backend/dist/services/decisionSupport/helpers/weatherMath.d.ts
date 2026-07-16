export declare class WeatherMath {
    static relativeHumidity(temperature: number, dewPoint: number): number;
    static dewPoint(temperature: number, humidity: number): number;
    static densityAltitude(elevationFt: number, temperature: number, qnh: number): number;
    static pressureAltitude(elevationFt: number, qnh: number): number;
    static isaTemperature(elevationFt: number): number;
    static heatIndex(temperature: number, humidity: number): number;
    static windChill(temperature: number, windSpeedKt: number): number;
    static saturationVaporPressure(temperature: number): number;
    static actualVaporPressure(temperature: number, humidity: number): number;
    static virtualTemperature(temperature: number, humidity: number, pressure: number): number;
    static cloudCeiling(cloudBaseMeters: number): number;
    static metersToFeet(metres: number): number;
    static feetToMeters(feet: number): number;
    static knotsToKmh(knots: number): number;
    static knotsToMetersPerSecond(knots: number): number;
    static visibilityMiles(visibilityMeters: number): number;
    static fogProbability(temperature: number, dewPoint: number, windKt: number): number;
    static thunderstormProbability(temperature: number, humidity: number, cloudAmount: number): number;
    static visibilityCategory(visibilityMeters: number): string;
    static ceilingCategory(ceilingFeet: number): string;
}
//# sourceMappingURL=weatherMath.d.ts.map