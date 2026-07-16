/**
 * ============================================================================
 * Cloud Coverage
 * ============================================================================
 */

export enum CloudCoverage {

    SKC = "SKC",

    FEW = "FEW",

    SCT = "SCT",

    BKN = "BKN",

    OVC = "OVC"

}

/**
 * ============================================================================
 * Cloud Forecast
 * ============================================================================
 */

export interface CloudForecast {

    /**
     * Cloud coverage
     */
    coverage: CloudCoverage;

    /**
     * Cloud base (ft)
     */
    base: number;

    /**
     * Cloud top (ft)
     */
    top?: number;

    /**
     * Ceiling (ft)
     */
    ceiling?: number;

    /**
     * Cumulonimbus present
     */
    cumulonimbus: boolean;

    /**
     * Towering cumulus present
     */
    toweringCumulus: boolean;

}