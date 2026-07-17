import { Request, Response } from 'express';
export declare class AlertController {
    static getAlerts(req: Request, res: Response): Promise<void>;
    static getUnreadCount(req: Request, res: Response): Promise<void>;
    static markRead(req: Request, res: Response): Promise<void>;
    static markAllRead(req: Request, res: Response): Promise<void>;
    static acknowledge(req: Request, res: Response): Promise<void>;
    static createAlert(req: Request, res: Response): Promise<void>;
    static delete(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=alert.controller.d.ts.map