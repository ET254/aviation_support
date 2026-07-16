/**
 * ============================================================================
 * Wind Operational Status
 * ============================================================================
 */

export enum WindOperationalStatus {

    NORMAL = "NORMAL",

    CAUTION = "CAUTION",

    WARNING = "WARNING",

    CRITICAL = "CRITICAL"

}

/**
 * ============================================================================
 * Wind Forecast
 * ============================================================================
 */

export interface WindForecast {

    /**
     * Wind direction (degrees true)
     */
    direction: number;

    /**
     * Wind speed (knots)
     */
    speed: number;

    /**
     * Gust speed (knots)
     */
    gust?: number;

    /**
     * East-West component (m/s)
     */
    uComponent: number;

    /**
     * North-South component (m/s)
     */
    vComponent: number;

    /**
     * Vertical velocity (m/s)
     */
    verticalVelocity?: number;

    /**
     * Crosswind component (knots)
     */
    crosswindComponent?: number;

    /**
     * Headwind component (knots)
     */
    headwindComponent?: number;

    /**
     * Tailwind component (knots)
     */
    tailwindComponent?: number;

    /**
     * Wind Shear detected
     */
    windShear: boolean;

    /**
     * Operational assessment
     */
    operationalStatus: WindOperationalStatus;

}