import { AlertPriority } from "./AlertPriority";
import { AlertRecipient } from "./AlertRecipient";
import { AlertSeverity } from "./AlertSeverity";
export declare enum AlertCategory {
    VISIBILITY = "VISIBILITY",
    WIND = "WIND",
    RUNWAY = "RUNWAY",
    CLOUD = "CLOUD",
    ICING = "ICING",
    TURBULENCE = "TURBULENCE",
    THUNDERSTORM = "THUNDERSTORM",
    PRECIPITATION = "PRECIPITATION",
    DENSITY_ALTITUDE = "DENSITY_ALTITUDE",
    VOLCANIC_ASH = "VOLCANIC_ASH",
    GENERAL = "GENERAL"
}
export declare enum AlertStatus {
    ACTIVE = "ACTIVE",
    ACKNOWLEDGED = "ACKNOWLEDGED",
    RESOLVED = "RESOLVED",
    CANCELLED = "CANCELLED"
}
export interface AlertModel {
    id: string;
    stationId: string;
    stationCode: string;
    stationName?: string;
    category: AlertCategory;
    severity: AlertSeverity;
    priority: AlertPriority;
    status: AlertStatus;
    title: string;
    message: string;
    summary: string;
    hazard: string;
    operationalImpact: string;
    recommendedActions: string[];
    recipients: AlertRecipient[];
    riskScore: number;
    confidence?: number;
    issuedAt: Date;
    validFrom: Date;
    validTo?: Date;
    expiresAt?: Date;
    source: string;
    weatherParameter?: string;
    parameterValue?: number | string;
    threshold?: number | string;
    metadata?: Record<string, unknown>;
}
//# sourceMappingURL=AlertModel.d.ts.map