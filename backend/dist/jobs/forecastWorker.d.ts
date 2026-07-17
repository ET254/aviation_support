export declare class ForecastWorker {
    static run(filePath: string): Promise<{
        parsed: any[];
        airportImpact: {
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
    }>;
}
//# sourceMappingURL=forecastWorker.d.ts.map