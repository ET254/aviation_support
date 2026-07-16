/**
 * ============================================================================
 * Turbulence Severity
 * ============================================================================
 */

export enum TurbulenceSeverity {

    NONE = "NONE",

    LIGHT = "LIGHT",

    MODERATE = "MODERATE",

    SEVERE = "SEVERE"

}

/**
 * ============================================================================
 * Turbulence Forecast
 * ============================================================================
 */

export interface TurbulenceForecast {

    severity: TurbulenceSeverity;

    lowLevel: boolean;

    mountainWave: boolean;

    clearAirTurbulence: boolean;

}