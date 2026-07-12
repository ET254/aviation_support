import { AlertModel, AlertCategory, AlertStatus } from "../models/AlertModel";
import { AlertSeverity } from "../models/AlertSeverity";
import { AlertPriority } from "../models/AlertPriority";

/**
 * ============================================================================
 * Alert Utilities
 *
 * Shared utility functions for manipulating alert collections.
 * ============================================================================
 */

export class AlertUtils {

    /**
     * =========================================================================
     * Sort alerts by severity, priority, risk score and issue time.
     * =========================================================================
     */
    static sort(alerts: AlertModel[]): AlertModel[] {

        return [...alerts].sort((a, b) => {

            const severity =
                this.severityWeight(b.severity) -
                this.severityWeight(a.severity);

            if (severity !== 0)
                return severity;

            const priority =
                this.priorityWeight(b.priority) -
                this.priorityWeight(a.priority);

            if (priority !== 0)
                return priority;

            const risk =
                (b.riskScore ?? 0) -
                (a.riskScore ?? 0);

            if (risk !== 0)
                return risk;

            return (
                b.issuedAt.getTime() -
                a.issuedAt.getTime()
            );

        });

    }

    /**
     * =========================================================================
     * Active alerts only
     * =========================================================================
     */
    static active(alerts: AlertModel[]): AlertModel[] {

        return alerts.filter(

            alert =>

                alert.status === AlertStatus.ACTIVE

        );

    }

    /**
     * =========================================================================
     * Alerts by category
     * =========================================================================
     */
    static byCategory(

        alerts: AlertModel[],

        category: AlertCategory

    ): AlertModel[] {

        return alerts.filter(

            alert =>

                alert.category === category

        );

    }

    /**
     * =========================================================================
     * Alerts by severity
     * =========================================================================
     */
    static bySeverity(

        alerts: AlertModel[],

        severity: AlertSeverity

    ): AlertModel[] {

        return alerts.filter(

            alert =>

                alert.severity === severity

        );

    }

    /**
     * =========================================================================
     * Alerts by priority
     * =========================================================================
     */
    static byPriority(

        alerts: AlertModel[],

        priority: AlertPriority

    ): AlertModel[] {

        return alerts.filter(

            alert =>

                alert.priority === priority

        );

    }

    /**
     * =========================================================================
     * Highest severity alert
     * =========================================================================
     */
    static highestSeverity(

        alerts: AlertModel[]

    ): AlertModel | undefined {

        return this.sort(alerts)[0];

    }

    /**
     * =========================================================================
     * Highest risk alert
     * =========================================================================
     */
    static highestRisk(

        alerts: AlertModel[]

    ): AlertModel | undefined {

        if (alerts.length === 0)
            return undefined;

        return [...alerts].sort(

            (a, b) =>

                (b.riskScore ?? 0) -

                (a.riskScore ?? 0)

        )[0];

    }

    /**
     * =========================================================================
     * Group alerts by category
     * =========================================================================
     */
    static groupByCategory(

        alerts: AlertModel[]

    ): Record<string, AlertModel[]> {

        const groups: Record<string, AlertModel[]> = {};

        for (const alert of alerts) {

            if (!groups[alert.category]) {

                groups[alert.category] = [];

            }

            groups[alert.category].push(alert);

        }

        return groups;

    }

    /**
     * =========================================================================
     * Group alerts by severity
     * =========================================================================
     */
    static groupBySeverity(

        alerts: AlertModel[]

    ): Record<string, AlertModel[]> {

        const groups: Record<string, AlertModel[]> = {};

        for (const alert of alerts) {

            if (!groups[alert.severity]) {

                groups[alert.severity] = [];

            }

            groups[alert.severity].push(alert);

        }

        return groups;

    }

    /**
     * =========================================================================
     * Count active alerts
     * =========================================================================
     */
    static countActive(

        alerts: AlertModel[]

    ): number {

        return this.active(alerts).length;

    }

    /**
     * =========================================================================
     * Count alerts by category
     * =========================================================================
     */
    static countCategory(

        alerts: AlertModel[],

        category: AlertCategory

    ): number {

        return this.byCategory(

            alerts,

            category

        ).length;

    }

    /**
     * =========================================================================
     * Count alerts by severity
     * =========================================================================
     */
    static countSeverity(

        alerts: AlertModel[],

        severity: AlertSeverity

    ): number {

        return this.bySeverity(

            alerts,

            severity

        ).length;

    }

    /**
     * =========================================================================
     * Severity ranking
     * =========================================================================
     */
    private static severityWeight(

        severity: AlertSeverity

    ): number {

        switch (severity) {

            case AlertSeverity.EMERGENCY:
                return 5;

            case AlertSeverity.WARNING:
                return 4;

            case AlertSeverity.WATCH:
                return 3;

            case AlertSeverity.ADVISORY:
                return 2;

            case AlertSeverity.INFORMATION:
                return 1;

            default:
                return 0;

        }

    }

    /**
     * =========================================================================
     * Priority ranking
     * =========================================================================
     */
    private static priorityWeight(

        priority: AlertPriority

    ): number {

        switch (priority) {

            case AlertPriority.IMMEDIATE:
                return 5;

            case AlertPriority.URGENT:
                return 4;

            case AlertPriority.HIGH:
                return 3;

            case AlertPriority.NORMAL:
                return 2;

            case AlertPriority.LOW:
                return 1;

            default:
                return 0;

        }

    }

}