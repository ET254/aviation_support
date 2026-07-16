/**
 * ============================================================================
 * Visibility Operational Status
 * ============================================================================
 */

export enum VisibilityOperationalStatus {

    NORMAL = "NORMAL",

    CAUTION = "CAUTION",

    LOW = "LOW",

    VERY_LOW = "VERY_LOW"

}

/**
 * ============================================================================
 * Flight Category
 * ============================================================================
 */

export enum FlightCategory {

    VFR = "VFR",

    MVFR = "MVFR",

    IFR = "IFR",

    LIFR = "LIFR"

}

/**
 * ============================================================================
 * Visibility Forecast
 * ============================================================================
 */

export interface VisibilityForecast {

    /**
     * Horizontal visibility (metres)
     */
    visibility: number;

    /**
     * Flight category
     */
    flightCategory: FlightCategory;

    /**
     * Fog present
     */
    fog: boolean;

    /**
     * Mist present
     */
    mist: boolean;

    /**
     * Haze present
     */
    haze: boolean;

    /**
     * Dust present
     */
    dust: boolean;

    /**
     * Smoke present
     */
    smoke: boolean;

    /**
     * Operational assessment
     */
    operationalStatus: VisibilityOperationalStatus;

}