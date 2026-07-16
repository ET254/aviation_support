/**
 * ============================================================================
 * Raw Forecast
 *
 * Represents weather variables extracted directly from the WRF NetCDF file
 * before any aviation calculations are performed.
 * ============================================================================
 */

export interface RawForecast {

    /**
     * Station metadata
     */
    stationId: string;

    stationCode: string;

    stationName: string;

    latitude: number;

    longitude: number;

    elevation: number;

    /**
     * Forecast validity
     */
    validTime: string;

    forecastHour: number;

    /**
     * Wind
     */
    u10: number;

    v10: number;

    w?: number;

    /**
     * Temperature
     */
    t2: number;

    skinTemperature: number;

    /**
     * Moisture
     */
    q2: number;

    qvapor?: number;

    relativeHumidity?: number;

    /**
     * Pressure
     */
    surfacePressure: number;

    pressure?: number;

    basePressure?: number;

    /**
     * Rain
     */
    rainc: number;

    rainnc: number;

    rainsh?: number;

    /**
     * Clouds
     */
    cloudFraction?: number;

    cloudWater?: number;

    cloudIce?: number;

    /**
     * Snow / Ice
     */
    snow?: number;

    graupel?: number;

    hail?: number;

    /**
     * Visibility related
     */
    pblHeight?: number;

    /**
     * Radiation
     */
    swdown?: number;

    glw?: number;

    /**
     * Surface
     */
    landMask?: number;

    terrainHeight?: number;

    /**
     * Model metadata
     */
    modelRun: string;

    modelName: string;

    sourceFile: string;

    extractedAt: string;

}