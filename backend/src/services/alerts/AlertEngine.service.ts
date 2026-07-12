import { CanonicalWeatherObservation } from "../../models/weather/CanonicalWeatherObservation";

import { AlertModel } from "./models/AlertModel";

import { VisibilityAlertGenerator } from "./generators/visibilityAlert.generator";
import { WindAlertGenerator } from "./generators/windAlert.generator";
import { RunwayAlertGenerator } from "./generators/runwayAlert.generator";
import { CloudAlertGenerator } from "./generators/cloudAlert.generator";
import { IcingAlertGenerator } from "./generators/icingAlert.generator";
import { TurbulenceAlertGenerator } from "./generators/turbulenceAlert.generator";
import { ThunderstormAlertGenerator } from "./generators/thunderstormAlert.generator";
import { PrecipitationAlertGenerator } from "./generators/precipitationAlert.generator";
import { DensityAltitudeAlertGenerator } from "./generators/densityAltitudeAlert.generator";
import { VolcanicAshAlertGenerator } from "./generators/volcanicAshAlert.generator";

/**
 * ============================================================================
 * Alert Engine Result
 * ============================================================================
 */

export interface AlertEngineResult {

    stationId: string;

    stationCode: string;

    generatedAt: Date;

    totalAlerts: number;

    alerts: AlertModel[];

    highestSeverity?: string;

    highestPriority?: string;

    overallOperationalStatus:
        | "NORMAL"
        | "CAUTION"
        | "RESTRICTED"
        | "CRITICAL";

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

/**
 * ============================================================================
 * Aviation Alert Engine
 *
 * This is the central orchestration service.
 *
 * It never performs weather calculations.
 *
 * Instead, it coordinates all specialised generators and returns a unified,
 * sorted collection of operational alerts.
 * ============================================================================
 */

export class AlertEngine {

    /**
     * =========================================================================
     * Generate all alerts
     * =========================================================================
     */

    static generate(

        weather: CanonicalWeatherObservation

    ): AlertEngineResult {

        //---------------------------------------------------------
        // Execute all generators
        //---------------------------------------------------------

        const generatedAlerts = [

            VisibilityAlertGenerator.generate(weather),

            WindAlertGenerator.generate(weather),

            RunwayAlertGenerator.generate(weather),

            CloudAlertGenerator.generate(weather),

            IcingAlertGenerator.generate(weather),

            TurbulenceAlertGenerator.generate(weather),

            ThunderstormAlertGenerator.generate(weather),

            PrecipitationAlertGenerator.generate(weather),

            DensityAltitudeAlertGenerator.generate(weather),

            VolcanicAshAlertGenerator.generate(weather)

        ];

        //---------------------------------------------------------
        // Remove null alerts
        //---------------------------------------------------------

        const alerts = generatedAlerts.filter(

            (alert): alert is AlertModel =>

                alert !== null

        );

        //---------------------------------------------------------
        // Sorting
        // (implemented in Part 2)
        //---------------------------------------------------------

        const sortedAlerts =
            this.sortAlerts(alerts);

        //---------------------------------------------------------
        // Return
        //---------------------------------------------------------

        const highest =
    this.highestSeverity(sortedAlerts);

const overallRisk =
    this.calculateOverallRisk(sortedAlerts);

return {

    stationId:
        weather.stationId,

    stationCode:
        weather.stationCode,

    generatedAt:
        new Date(),

    totalAlerts:
        sortedAlerts.length,

    alerts:
        sortedAlerts,

    highestSeverity:
        highest?.severity,

    highestPriority:
        highest?.priority,

    overallOperationalStatus:
        this.overallStatus(sortedAlerts),

    overallRiskScore:
        overallRisk,

    summary:
        this.executiveSummary(
            weather.stationCode,
            sortedAlerts,
            overallRisk
        ),

    statistics: {

        emergency:
            this.countBySeverity(
                sortedAlerts,
                "EMERGENCY"
            ),

        warning:
            this.countBySeverity(
                sortedAlerts,
                "WARNING"
            ),

        watch:
            this.countBySeverity(
                sortedAlerts,
                "WATCH"
            ),

        advisory:
            this.countBySeverity(
                sortedAlerts,
                "ADVISORY"
            ),

        information:
            this.countBySeverity(
                sortedAlerts,
                "INFORMATION"
            )

    }

};
    }
        /**
     * =========================================================================
     * Sort Alerts
     * =========================================================================
     */

    private static sortAlerts(

        alerts: AlertModel[]

    ): AlertModel[] {

        const unique =
            this.removeDuplicates(alerts);

        return unique.sort((a, b) => {

            //-----------------------------------------------------
            // Severity
            //-----------------------------------------------------

            const severityDifference =
                this.severityWeight(b.severity) -
                this.severityWeight(a.severity);

            if (severityDifference !== 0)
                return severityDifference;

            //-----------------------------------------------------
            // Priority
            //-----------------------------------------------------

            const priorityDifference =
                this.priorityWeight(b.priority) -
                this.priorityWeight(a.priority);

            if (priorityDifference !== 0)
                return priorityDifference;

            //-----------------------------------------------------
            // Risk Score
            //-----------------------------------------------------

            const scoreDifference =
                (b.riskScore ?? 0) -
                (a.riskScore ?? 0);

            if (scoreDifference !== 0)
                return scoreDifference;

            //-----------------------------------------------------
            // Timestamp
            //-----------------------------------------------------

            return (
                b.issuedAt.getTime() -
                a.issuedAt.getTime()
            );

        });

    }

    /**
     * =========================================================================
     * Remove Duplicate Alerts
     * =========================================================================
     */

    private static removeDuplicates(

        alerts: AlertModel[]

    ): AlertModel[] {

        const map =
            new Map<string, AlertModel>();

        for (const alert of alerts) {

            const key =
                `${alert.stationId}-${alert.category}`;

            const existing =
                map.get(key);

            if (!existing) {

                map.set(
                    key,
                    alert
                );

                continue;

            }

            //-----------------------------------------------------
            // Keep higher risk alert
            //-----------------------------------------------------

            if (

                (alert.riskScore ?? 0) >
                (existing.riskScore ?? 0)

            ) {

                map.set(
                    key,
                    alert
                );

            }

        }

        return [...map.values()];

    }

    /**
     * =========================================================================
     * Severity Weight
     * =========================================================================
     */

    private static severityWeight(

        severity: string

    ): number {

        switch (severity) {

            case "EMERGENCY":
                return 5;

            case "WARNING":
                return 4;

            case "WATCH":
                return 3;

            case "ADVISORY":
                return 2;

            case "INFORMATION":
                return 1;

            default:
                return 0;

        }

    }

    /**
     * =========================================================================
     * Priority Weight
     * =========================================================================
     */

    private static priorityWeight(

        priority: string

    ): number {

        switch (priority) {

            case "IMMEDIATE":
                return 5;

            case "URGENT":
                return 4;

            case "HIGH":
                return 3;

            case "NORMAL":
                return 2;

            case "LOW":
                return 1;

            default:
                return 0;

        }

    }

    /**
     * =========================================================================
     * Highest Severity Alert
     * =========================================================================
     */

    private static highestSeverity(

        alerts: AlertModel[]

    ): AlertModel | undefined {

        if (alerts.length === 0)
            return undefined;

        return this.sortAlerts(alerts)[0];

    }

    /**
     * =========================================================================
     * Count Alerts By Severity
     * =========================================================================
     */

    private static countBySeverity(

        alerts: AlertModel[],

        severity: string

    ): number {

        return alerts.filter(

            alert =>
                alert.severity === severity

        ).length;

    }

    /**
     * =========================================================================
     * Count Alerts By Category
     * =========================================================================
     */

    private static countByCategory(

        alerts: AlertModel[],

        category: string

    ): number {

        return alerts.filter(

            alert =>
                alert.category === category

        ).length;

    }

/**
 * =========================================================================
 * Overall Operational Status
 * =========================================================================
 */

private static overallStatus(

    alerts: AlertModel[]

):
    | "NORMAL"
    | "CAUTION"
    | "RESTRICTED"
    | "CRITICAL" {

    if (alerts.length === 0)
        return "NORMAL";

    if (
        alerts.some(
            a => a.severity === "EMERGENCY"
        )
    )
        return "CRITICAL";

    if (
        alerts.some(
            a => a.severity === "WARNING"
        )
    )
        return "RESTRICTED";

    if (
        alerts.some(
            a => a.severity === "WATCH"
        )
    )
        return "CAUTION";

    return "NORMAL";

}

/**
 * =========================================================================
 * Overall Risk Score
 * =========================================================================
 */

private static calculateOverallRisk(

    alerts: AlertModel[]

): number {

    if (alerts.length === 0)
        return 0;

    const total =
        alerts.reduce(

            (sum, alert) =>
                sum + (alert.riskScore ?? 0),

            0

        );

    return Number(
        (total / alerts.length)
            .toFixed(1)
    );

}

/**
 * =========================================================================
 * Executive Summary
 * =========================================================================
 */

private static executiveSummary(

    stationCode: string,

    alerts: AlertModel[],

    risk: number

): string {

    if (alerts.length === 0) {

        return `${stationCode}: No operational weather hazards detected.`;

    }

    const highest =
        alerts[0];

    return `${stationCode}: ${alerts.length} active aviation alert(s). Highest severity is ${highest.severity}. Overall operational risk score is ${risk}.`;

}

/**
 * =========================================================================
 * Count Total Critical Alerts
 * =========================================================================
 */

private static criticalAlerts(

    alerts: AlertModel[]

): number {

    return alerts.filter(

        alert =>

            alert.severity === "WARNING" ||

            alert.severity === "EMERGENCY"

    ).length;

}

/**
 * =========================================================================
 * Whether Immediate Action Is Required
 * =========================================================================
 */

private static requiresImmediateAction(

    alerts: AlertModel[]

): boolean {

    return alerts.some(

        alert =>

            alert.priority === "IMMEDIATE" ||

            alert.priority === "URGENT"

    );

}

    /**
     * =========================================================================
     * Group Alerts By Category
     * =========================================================================
     */

    static groupByCategory(
        alerts: AlertModel[]
    ): Record<string, AlertModel[]> {

        const grouped: Record<string, AlertModel[]> = {};

        for (const alert of alerts) {

            if (!grouped[alert.category]) {

                grouped[alert.category] = [];

            }

            grouped[alert.category].push(alert);

        }

        return grouped;

    }

    /**
     * =========================================================================
     * Group Alerts By Severity
     * =========================================================================
     */

    static groupBySeverity(
        alerts: AlertModel[]
    ): Record<string, AlertModel[]> {

        const grouped: Record<string, AlertModel[]> = {};

        for (const alert of alerts) {

            if (!grouped[alert.severity]) {

                grouped[alert.severity] = [];

            }

            grouped[alert.severity].push(alert);

        }

        return grouped;

    }

    /**
     * =========================================================================
     * Alerts Requiring Immediate Action
     * =========================================================================
     */

    static immediateAlerts(
        alerts: AlertModel[]
    ): AlertModel[] {

        return alerts.filter(

            alert =>

                alert.priority === "IMMEDIATE" ||

                alert.priority === "URGENT"

        );

    }

    /**
     * =========================================================================
     * Dashboard Cards
     * =========================================================================
     */

    static dashboardCards(
        alerts: AlertModel[]
    ) {

        return alerts.map(alert => ({

            id:
                alert.id,

            title:
                alert.title,

            category:
                alert.category,

            severity:
                alert.severity,

            priority:
                alert.priority,

           
            station:
                alert.stationCode,

            summary:
                alert.summary,

            riskScore:
                alert.riskScore,

            issuedAt:
                alert.issuedAt

        }));

    }

    /**
     * =========================================================================
     * Notification Payload
     * =========================================================================
     */

    static notificationPayload(
        alerts: AlertModel[]
    ) {

        return alerts.map(alert => ({

            id:
                alert.id,

            station:
                alert.stationCode,

            title:
                alert.title,

            severity:
                alert.severity,

            priority:
                alert.priority,

            summary:
                alert.summary,

            message:
                alert.message,

            recommendedActions:
                alert.recommendedActions

        }));

    }

    /**
     * =========================================================================
     * Database Persistence Hook
     *
     * Future:
     * Save generated alerts into Prisma.
     * =========================================================================
     */

    static async persistAlerts(

        alerts: AlertModel[]

    ): Promise<void> {

        // Future implementation:
        //
        // await prisma.alert.createMany(...)
        //
        // Alerts are intentionally kept in memory for now.

        void alerts;

    }

    /**
     * =========================================================================
     * Notification Hook
     *
     * Future:
     * Email
     * SMS
     * WhatsApp
     * Push
     * Dashboard
     * =========================================================================
     */

    static async dispatchAlerts(

        alerts: AlertModel[]

    ): Promise<void> {

        // Future implementation:
        //
        // NotificationDispatcher.dispatch(alerts);

        void alerts;

    }

    /**
     * =========================================================================
     * Audit Hook
     * =========================================================================
     */

    static audit(

        alerts: AlertModel[]

    ): void {

        console.info(

            `[AlertEngine] Generated ${alerts.length} alert(s).`

        );

    }

}