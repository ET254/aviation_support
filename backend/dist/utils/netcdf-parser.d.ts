export declare class NetCDFParser {
    static parseFile(filePath: string): Promise<any[]>;
    static parseNetCDFData(buffer: Buffer, sourcePath?: string, sourceModifiedAt?: Date): any[];
    static getDefaultFilePath(): string;
    private static getFileSeed;
    static generateTAFFromNetCDF(index: number, fileSeed: number): string;
    static generateSIGMETFromNetCDF(index: number, fileSeed: number): any;
    static generateUpperWindFromNetCDF(index: number, fileSeed: number): any;
    static generateUpperTempFromNetCDF(index: number, fileSeed: number): any;
    static getTurbulenceForecast(index: number, fileSeed: number): string;
    static getIcingForecast(index: number, fileSeed: number): string;
    static extractVariable(reader: any, variableName: string): any;
    static getDimensions(reader: any): any;
}
export default NetCDFParser;
//# sourceMappingURL=netcdf-parser.d.ts.map