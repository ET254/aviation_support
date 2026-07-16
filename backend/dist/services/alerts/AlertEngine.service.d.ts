import { CanonicalWeatherObservation } from "../../models/weather/CanonicalWeatherObservation";
import { AlertModel } from "./models/AlertModel";
export interface AlertEngineResult {
    stationId: string;
    stationCode: string;
    generatedAt: Date;
    totalAlerts: number;
    alerts: AlertModel[];
    highestSeverity?: string;
    highestPriority?: string;
    overallOperationalStatus: "NORMAL" | "CAUTION" | "RESTRICTED" | "CRITICAL";
    overallRiskScore: number;
    summary: string;
    statistics: {
        emergency: number;
        warning: number;
        watch: number;
        advisory: number;
        information: number;
    };
}
export declare class AlertEngine {
    static generate(weather: CanonicalWeatherObservation): AlertEngineResult;
    private static sortAlerts;
    private static removeDuplicates;
    private static severityWeight;
    private static priorityWeight;
    private static highestSeverity;
    private static countBySeverity;
    private static countByCategory;
    private static overallStatus;
    private static calculateOverallRisk;
    private static executiveSummary;
    private static criticalAlerts;
    private static requiresImmediateAction;
    static groupByCategory(alerts: AlertModel[]): Record<string, AlertModel[]>;
    static groupBySeverity(alerts: AlertModel[]): Record<string, AlertModel[]>;
    static immediateAlerts(alerts: AlertModel[]): AlertModel[];
    static dashboardCards(alerts: AlertModel[]): {
        id: string;
        title: string;
        category: import("./models/AlertModel").AlertCategory;
        severity: import("./models/AlertSeverity").AlertSeverity;
        priority: import("./models/AlertPriority").AlertPriority;
        station: string;
        summary: string;
        riskScore: number;
        issuedAt: Date;
    }[];
    static notificationPayload(alerts: AlertModel[]): {
        id: string;
        station: string;
        title: string;
        severity: import("./models/AlertSeverity").AlertSeverity;
        priority: import("./models/AlertPriority").AlertPriority;
        summary: string;
        message: string;
        recommendedActions: string[];
    }[];
    static persistAlerts(alerts: AlertModel[]): Promise<void>;
    static dispatchAlerts(alerts: AlertModel[]): Promise<void>;
    static audit(alerts: AlertModel[]): void;
}
//# sourceMappingURL=AlertEngine.service.d.ts.map