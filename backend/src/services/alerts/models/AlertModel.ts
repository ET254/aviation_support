import { AlertPriority } from "./AlertPriority";
import { AlertRecipient } from "./AlertRecipient";
import { AlertSeverity } from "./AlertSeverity";

/**
 * ============================================================================
 * Alert Category
 * ============================================================================
 */

export enum AlertCategory {

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

/**
 * ============================================================================
 * Alert Status
 * ============================================================================
 */

export enum AlertStatus {

    ACTIVE = "ACTIVE",

    ACKNOWLEDGED = "ACKNOWLEDGED",

    RESOLVED = "RESOLVED",

    CANCELLED = "CANCELLED"

}

/**
 * ============================================================================
 * Aviation Alert
 * ============================================================================
 */

export interface AlertModel {

    /**
     * Unique alert ID
     */
    id: string;

    /**
     * ICAO station identifier
     */
    stationId: string;

    stationCode: string;

    stationName?: string;

    /**
     * Alert classification
     */
    category: AlertCategory;

    severity: AlertSeverity;

    priority: AlertPriority;

    status: AlertStatus;

    /**
     * Human-readable information
     */
    title: string;

    message: string;

    summary: string;

    /**
     * Operational information
     */
    hazard: string;

    operationalImpact: string;

    recommendedActions: string[];

    /**
     * Stakeholders
     */
    recipients: AlertRecipient[];

    /**
     * Risk assessment
     */
    riskScore: number;

    confidence?: number;

    /**
     * Validity
     */
    issuedAt: Date;

    validFrom: Date;

    validTo?: Date;

    expiresAt?: Date;

    /**
     * Source information
     */
    source: string;

    weatherParameter?: string;

    parameterValue?: number | string;

    threshold?: number | string;

    /**
     * Optional metadata
     */
    metadata?: Record<string, unknown>;

}