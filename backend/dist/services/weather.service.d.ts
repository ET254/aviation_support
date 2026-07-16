export declare class WeatherService {
    static calculateDerivedParameters(data: any): any;
    static calculateDensityAltitude(tempC: number, pressureQnh: number, elevation: number): number;
    static parseRunwayHeading(orientation: string): number;
    static calculateCrosswindComponent(windDirection: number, windSpeed: number, runwayHeading: number): number;
    static calculateHeadwindComponent(windDirection: number, windSpeed: number, runwayHeading: number): number;
    static calculateTailwindComponent(windDirection: number, windSpeed: number, runwayHeading: number): number;
    static calculateHeatIndex(tempC: number, humidity: number): number;
    static calculateWindChill(tempC: number, windSpeed: number): number;
    static checkThresholds(weatherData: any): Promise<void>;
    static checkThresholdBreach(value: number, minValue: number | null, maxValue: number | null): boolean;
    static parseCSVRecord(record: any): any;
    static parseExcelRecord(record: any): any;
    static analyzeTrends(weatherData: any[]): any;
    static calculateTrend(values: number[], field: string): 'increasing' | 'decreasing' | 'stable';
    static calculateAverage(values: number[]): number;
    static calculateStatistics(weatherData: any[]): any;
}
//# sourceMappingURL=weather.service.d.ts.map