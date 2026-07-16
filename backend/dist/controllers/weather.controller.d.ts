import { Request, Response } from 'express';
export declare class WeatherController {
    static create(req: Request, res: Response): Promise<void>;
    static getCurrent(req: Request, res: Response): Promise<void>;
    static getHistorical(req: Request, res: Response): Promise<void>;
    static getTrends(req: Request, res: Response): Promise<void>;
    static importData(req: Request, res: Response): Promise<void>;
    static getStats(req: Request, res: Response): Promise<void>;
    static update(req: Request, res: Response): Promise<void>;
    static delete(req: Request, res: Response): Promise<void>;
    static getLatestAllStations(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=weather.controller.d.ts.map