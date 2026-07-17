export declare class NetCDFParser {
    static parseFile(filePath: string): Promise<any[]>;
    private static extractNetCDFWithPython;
    private static convertExtractedDataToForecasts;
    private static generateDeterministicForecast;
    private static generateSampleForecast;
    private static generateTAFFromData;
    private static generateSIGMETFromData;
    private static generateUpperWind;
    private static generateUpperTemp;
    private static getTurbulenceForecast;
    private static getIcingForecast;
}
export default NetCDFParser;
//# sourceMappingURL=netcdf-parser.d.ts.map