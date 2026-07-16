/**
 * ============================================================================
 * Airport Operational Status
 * ============================================================================
 */

export enum AirportOperationalStatus {

    NORMAL = "NORMAL",

    CAUTION = "CAUTION",

    RESTRICTED = "RESTRICTED",

    CLOSED = "CLOSED"

}

/**
 * ============================================================================
 * Operational Forecast
 * ============================================================================
 */

export interface OperationalForecast {

    status: AirportOperationalStatus;

    runwaySuitable: boolean;

    departureAllowed: boolean;

    arrivalAllowed: boolean;

    vfrAllowed: boolean;

    ifrRequired: boolean;

    remarks: string[];

}