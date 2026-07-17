export declare class ForecastService {
    static generateTimeline(forecasts: any[], start: Date, end: Date): any[];
    static getConditionsAtTime(forecasts: any[], time: Date): any;
    static parseTAF(taf: string, time: Date): any;
    static parseSIGMET(sigmetData: any): any;
    static detectSIGMETType(sigmet: string): string;
    static detectSIGMETSeverity(sigmet: string): string;
    static processNetCDFData(filePath: string): Promise<any[]>;
    static generateSampleTAF(time: Date): string;
    static generateSampleSIGMET(time: Date): any;
    static generateSampleUpperWind(time: Date): any;
    static generateSampleUpperTemp(time: Date): any;
}
//# sourceMappingURL=forecast.service.d.ts.map