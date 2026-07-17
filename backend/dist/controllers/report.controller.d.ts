import { Request, Response } from 'express';
export declare class ReportController {
    static generateWeatherReport(req: Request, res: Response): Promise<void>;
    static generateImpactReport(req: Request, res: Response): Promise<void>;
    static generateOperationalReport(req: Request, res: Response): Promise<void>;
    static exportCSV(req: Request, res: Response): Promise<void>;
    static exportExcel(req: Request, res: Response): Promise<void>;
    static getTemplates(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=report.controller.d.ts.map