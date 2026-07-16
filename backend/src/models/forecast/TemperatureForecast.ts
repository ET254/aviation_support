/**
 * ============================================================================
 * Temperature Operational Status
 * ============================================================================
 */

export enum TemperatureOperationalStatus {

    NORMAL = "NORMAL",

    HOT = "HOT",

    VERY_HOT = "VERY_HOT",

    EXTREME = "EXTREME"

}

/**
 * ============================================================================
 * Temperature Forecast
 * ============================================================================
 */

export interface TemperatureForecast {

    /**
     * Air temperature at 2 metres (°C)
     */
    airTemperature: number;

    /**
     * Surface temperature (°C)
     */
    surfaceTemperature: number;

    /**
     * Dew point (°C)
     */
    dewPoint?: number;

    /**
     * Relative humidity (%)
     */
    relativeHumidity: number;

    /**
     * Apparent temperature (°C)
     */
    apparentTemperature?: number;

    /**
     * ISA deviation (°C)
     */
    isaDeviation?: number;

    /**
     * Operational assessment
     */
    operationalStatus: TemperatureOperationalStatus;

}