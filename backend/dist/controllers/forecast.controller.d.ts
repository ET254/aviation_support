import { Request, Response } from 'express';
export declare class ForecastController {
    private static createForecastRecords;
    private static ensureForecastsForStation;
    static create(req: Request, res: Response): Promise<void>;
    static getCurrent(req: Request, res: Response): Promise<void>;
    static getTAF(req: Request, res: Response): Promise<void>;
    static getSIGMET(req: Request, res: Response): Promise<void>;
    static importNetCDF(req: Request, res: Response): Promise<void>;
    static getUpperAir(req: Request, res: Response): Promise<void>;
    static getTimeline(req: Request, res: Response): Promise<void>;
    static update(req: Request, res: Response): Promise<void>;
    static delete(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=forecast.controller.d.ts.map