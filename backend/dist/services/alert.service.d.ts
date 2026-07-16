export declare class AlertService {
    static sendNotification(alert: any): Promise<void>;
    static sendEmailAlert(alert: any): Promise<void>;
    static sendSMSAlert(alert: any): Promise<void>;
    static createWeatherAlerts(weatherData: any, thresholds: any[]): Promise<void>;
    static checkThresholdBreach(value: number, minValue: number | null, maxValue: number | null): boolean;
    static getUnit(parameter: string): string;
    static cleanupExpiredAlerts(): Promise<void>;
    static getAlertStats(userId: string): Promise<any>;
}
//# sourceMappingURL=alert.service.d.ts.map