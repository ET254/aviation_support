import { RawForecast } from "../../models/forecast";

/**
 * ============================================================================
 * Variable Extractor
 *
 * Extracts weather variables from the WRF NetCDF file
 * for a specific station grid cell.
 * ============================================================================
 */

export class VariableExtractor {

/**
 * ============================================================================
 * Extract One Value
 * ============================================================================
 */

private static value(

    data: any,

    time: number,

    row: number,

    column: number

): number {

    return Number(

        data[time][row][column]

    );

}

/**
 * ============================================================================
 * Wind
 * ============================================================================
 */

static wind(

    u10: any,

    v10: any,

    time: number,

    row: number,

    column: number

) {

    return {

        u10: this.value(

            u10,

            time,

            row,

            column

        ),

        v10: this.value(

            v10,

            time,

            row,

            column

        )

    };

}

/**
 * ============================================================================
 * Temperature
 * ============================================================================
 */

static temperature(

    t2: any,

    time: number,

    row: number,

    column: number

): number {

    return this.value(

        t2,

        time,

        row,

        column

    );

}

/**
 * ============================================================================
 * Pressure
 * ============================================================================
 */

static pressure(

    psfc: any,

    time: number,

    row: number,

    column: number

): number {

    return this.value(

        psfc,

        time,

        row,

        column

    );

}

/**
 * ============================================================================
 * Humidity
 * ============================================================================
 */

static humidity(

    q2: any,

    time: number,

    row: number,

    column: number

): number {

    return this.value(

        q2,

        time,

        row,

        column

    );

}

/**
 * ============================================================================
 * Rainfall
 * ============================================================================
 */

static rainfall(

    rainc: any,

    rainnc: any,

    time: number,

    row: number,

    column: number

) {

    return {

        rainc: this.value(

            rainc,

            time,

            row,

            column

        ),

        rainnc: this.value(

            rainnc,

            time,

            row,

            column

        )

    };

}

/**
 * ============================================================================
 * Cloud Fraction
 * ============================================================================
 */

static cloudFraction(

    cloud: any,

    time: number,

    level: number,

    row: number,

    column: number

): number {

    return Number(

        cloud[time][level][row][column]

    );

}

}