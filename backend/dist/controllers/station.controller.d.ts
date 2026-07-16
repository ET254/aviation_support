import { Request, Response } from 'express';
export declare class StationController {
    static create(req: Request, res: Response): Promise<void>;
    static getAll(req: Request, res: Response): Promise<void>;
    static getActive(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<void>;
    static update(req: Request, res: Response): Promise<void>;
    static setActive(req: Request, res: Response): Promise<void>;
    static delete(req: Request, res: Response): Promise<void>;
    static getStats(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=station.controller.d.ts.map