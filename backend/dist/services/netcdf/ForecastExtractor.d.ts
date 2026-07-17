export declare class ForecastExtractor {
    static extract(filePath: string): {
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
}
//# sourceMappingURL=ForecastExtractor.d.ts.map