import { AlertModel, AlertCategory } from "../models/AlertModel";
import { AlertSeverity } from "../models/AlertSeverity";
import { AlertPriority } from "../models/AlertPriority";
export declare class AlertUtils {
    static sort(alerts: AlertModel[]): AlertModel[];
    static active(alerts: AlertModel[]): AlertModel[];
    static byCategory(alerts: AlertModel[], category: AlertCategory): AlertModel[];
    static bySeverity(alerts: AlertModel[], severity: AlertSeverity): AlertModel[];
    static byPriority(alerts: AlertModel[], priority: AlertPriority): AlertModel[];
    static highestSeverity(alerts: AlertModel[]): AlertModel | undefined;
    static highestRisk(alerts: AlertModel[]): AlertModel | undefined;
    static groupByCategory(alerts: AlertModel[]): Record<string, AlertModel[]>;
    static groupBySeverity(alerts: AlertModel[]): Record<string, AlertModel[]>;
    static countActive(alerts: AlertModel[]): number;
    static countCategory(alerts: AlertModel[], category: AlertCategory): number;
    static countSeverity(alerts: AlertModel[], severity: AlertSeverity): number;
    private static severityWeight;
    private static priorityWeight;
}
//# sourceMappingURL=alertUtils.d.ts.map