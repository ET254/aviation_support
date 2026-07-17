import { Request, Response } from 'express';
export declare class UserController {
    static getAll(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<void>;
    static update(req: Request, res: Response): Promise<void>;
    static delete(req: Request, res: Response): Promise<void>;
    static resetPassword(req: Request, res: Response): Promise<void>;
    static updatePreferences(req: Request, res: Response): Promise<void>;
    static getStats(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=user.controller.d.ts.map