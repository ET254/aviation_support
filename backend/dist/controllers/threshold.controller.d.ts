import { Request, Response } from 'express';
export declare class ThresholdController {
    static create(req: Request, res: Response): Promise<void>;
    static getByStation(req: Request, res: Response): Promise<void>;
    static getByRole(req: Request, res: Response): Promise<void>;
    static update(req: Request, res: Response): Promise<void>;
    static toggleActive(req: Request, res: Response): Promise<void>;
    static delete(req: Request, res: Response): Promise<void>;
    static applyDefaults(req: Request, res: Response): Promise<void>;
    static getByParameter(req: Request, res: Response): Promise<void>;
    static getStats(req: Request, res: Response): Promise<void>;
}
export default ThresholdController;
//# sourceMappingURL=threshold.controller.d.ts.map