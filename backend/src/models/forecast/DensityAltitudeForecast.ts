/**
 * ============================================================================
 * Density Altitude Forecast
 * ============================================================================
 */

export interface DensityAltitudeForecast {

    /**
     * Density altitude (ft)
     */
    densityAltitude: number;

    /**
     * Pressure altitude (ft)
     */
    pressureAltitude: number;

    /**
     * Performance penalty (%)
     */
    performancePenalty: number;

}