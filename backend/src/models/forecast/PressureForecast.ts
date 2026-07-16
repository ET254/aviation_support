/**
 * ============================================================================
 * Pressure Forecast
 * ============================================================================
 */

export interface PressureForecast {

    /**
     * Surface pressure (Pa)
     */
    surfacePressure: number;

    /**
     * Mean Sea Level Pressure (hPa)
     */
    meanSeaLevelPressure?: number;

    /**
     * QNH (hPa)
     */
    qnh?: number;

    /**
     * QFE (hPa)
     */
    qfe?: number;

    /**
     * Pressure altitude (ft)
     */
    pressureAltitude?: number;

}