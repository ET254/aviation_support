/**
 * ============================================================================
 * Precipitation Type
 * ============================================================================
 */

export enum PrecipitationType {

    NONE = "NONE",

    RAIN = "RAIN",

    DRIZZLE = "DRIZZLE",

    THUNDERSTORM = "THUNDERSTORM",

    HAIL = "HAIL",

    SNOW = "SNOW"

}

/**
 * ============================================================================
 * Precipitation Forecast
 * ============================================================================
 */

export interface PrecipitationForecast {

    /**
     * Precipitation type
     */
    type: PrecipitationType;

    /**
     * Rate (mm/hr)
     */
    rate: number;

    /**
     * Probability (%)
     */
    probability: number;

    /**
     * Accumulation (mm)
     */
    accumulation?: number;

}