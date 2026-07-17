export declare class AirportForecastProcessor {
    static process(filePath: string): {
        filePath: string;
        extracted: {
            metadata: {
                filePath: string;
                kind: string;
                metadata: {
                    variables: string[];
                    dimensions: string[];
                };
            };
            variables: {
                temperature: number[];
                windSpeed: number[];
                humidity: number[];
            };
        };
        interpolated: {
            values: Record<string, number[]>;
            interpolated: boolean;
        };
        airportImpact: string;
    };
}
//# sourceMappingURL=AirportForecastProcessor.d.ts.map