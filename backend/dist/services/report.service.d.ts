export declare class ReportService {
    static generateWeatherReport(stationId: string, startDate: Date, endDate: Date): Promise<any>;
    static calculateWeatherStats(data: any[]): any;
    static generateImpactReport(stationId: string, startDate: Date, endDate: Date): Promise<any>;
    static generateOperationalReport(stationId: string, startDate: Date, endDate: Date): Promise<any>;
    static countSeverities(logs: any[]): any;
    static average(values: number[]): number;
    static generateOperationalRecommendations(stationId: string, weatherData: any[]): Promise<any[]>;
    static determineOperationalStatus(weatherData: any[]): string;
    static exportToPDF(report: any): Promise<Buffer>;
    static exportToCSV(stationId: string, startDate: Date, endDate: Date, dataType: string): Promise<string>;
    static exportToExcel(stationId: string, startDate: Date, endDate: Date, dataType: string): Promise<Buffer>;
    static generateCombinedReport(stationId: string, startDate: Date, endDate: Date): Promise<any>;
    static exportReportToFile(stationId: string, startDate: Date, endDate: Date, format: 'pdf' | 'excel' | 'csv', dataType: string): Promise<Buffer | string>;
    static getReportTypes(): string[];
    static getExportFormats(): string[];
    static validateReportOptions(stationId: string, startDate: Date, endDate: Date, format: string, dataType: string): void;
}
export default ReportService;
//# sourceMappingURL=report.service.d.ts.map