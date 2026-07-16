/**
 * ============================================================================
 * Icing Severity
 * ============================================================================
 */

export enum IcingSeverity {

    NONE = "NONE",

    LIGHT = "LIGHT",

    MODERATE = "MODERATE",

    SEVERE = "SEVERE"

}

/**
 * ============================================================================
 * Icing Forecast
 * ============================================================================
 */

export interface IcingForecast {

    severity: IcingSeverity;

    freezingLevel: number;

    supercooledLiquidWater: boolean;

}