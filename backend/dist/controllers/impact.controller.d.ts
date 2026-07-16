import { Request, Response } from 'express';
export declare class ImpactController {
    static generate(req: Request, res: Response): Promise<void>;
    static getByRole(req: Request, res: Response): Promise<void>;
    static getLogs(req: Request, res: Response): Promise<void>;
    static getStats(req: Request, res: Response): Promise<void>;
    static acknowledge(req: Request, res: Response): Promise<void>;
    static getDecisionLadder(req: Request, res: Response): Promise<void>;
    static getActions(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=impact.controller.d.ts.map