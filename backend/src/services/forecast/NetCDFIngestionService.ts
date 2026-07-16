import fs from "fs/promises";
import path from "path";
import * as netcdfjs from "netcdfjs";
import { logger } from "../../utils/logger";

import { RawForecast } from "../../models/forecast";

import { ForecastMapper } from "../../adapters/ForecastMapper";

/**
 * ============================================================================
 * NetCDF Ingestion Service
 *
 * Reads the WRF NetCDF forecast,
 * extracts airport forecasts,
 * converts them into Forecast objects,
 * and stores them inside the forecast cache.
 * ============================================================================
 */

export class NetCDFIngestionService {

    /**
     * Location of the WRF forecast.
     */

    private static readonly NETCDF_FILE = path.join(

        process.cwd(),

        "backend",

        "data",

        "forecast",

        "netcdf",

        "wrfout_d01_nc.nc"

    );

    /**
     * Forecast cache folder.
     */

    private static readonly CACHE_DIRECTORY = path.join(

        process.cwd(),

        "data",

        "forecast",

        "cache"

    );

    /**
 * ============================================================================
 * Validate Forecast File
 * ============================================================================
 */

private static async validateForecastFile(): Promise<void> {

    try {

        await fs.access(this.NETCDF_FILE);

        logger.info(

            `Forecast file found: ${this.NETCDF_FILE}`

        );

    }

    catch {

        throw new Error(

            `Forecast file not found: ${this.NETCDF_FILE}`

        );

    }

}

/**
 * ============================================================================
 * Ensure Cache Directory
 * ============================================================================
 */

private static async ensureCacheDirectory(): Promise<void> {

    await fs.mkdir(

        this.CACHE_DIRECTORY,

        {

            recursive: true

        }

    );

}

/**
 * ============================================================================
 * Open WRF NetCDF File
 * ============================================================================
 */

private static async openForecast(): Promise<any> {

    await this.validateForecastFile();

    const buffer = await fs.readFile(
        this.NETCDF_FILE
    );

    logger.info(
        "Opening WRF NetCDF forecast..."
    );

    return new (netcdfjs as any)(buffer);

}

/**
 * ============================================================================
 * Read Variable
 * ============================================================================
 */

private static readVariable<T>(

    reader: { getDataVariable: (name: string) => unknown },

    variableName: string

): T {

    const variable = reader.getDataVariable(
        variableName
    );

    if (!variable) {

        throw new Error(

            `Variable ${variableName} not found in NetCDF file.`

        );

    }

    return variable as T;

}

/**
 * ============================================================================
 * Read WRF Variables
 * ============================================================================
 */

private static async loadVariables() {

    const reader = await this.openForecast();

    logger.info(
        "Loading WRF variables..."
    );

    return {

        times: this.readVariable<any>(
            reader,
            "Times"
        ),

        latitude: this.readVariable<Float32Array>(
            reader,
            "XLAT"
        ),

        longitude: this.readVariable<Float32Array>(
            reader,
            "XLONG"
        ),

        temperature: this.readVariable<Float32Array>(
            reader,
            "T2"
        ),

        uWind: this.readVariable<Float32Array>(
            reader,
            "U10"
        ),

        vWind: this.readVariable<Float32Array>(
            reader,
            "V10"
        ),

        pressure: this.readVariable<Float32Array>(
            reader,
            "PSFC"
        ),

        humidity: this.readVariable<Float32Array>(
            reader,
            "Q2"
        ),

        cloud: this.readVariable<Float32Array>(
            reader,
            "CLDFRA"
        ),

        rainConvective: this.readVariable<Float32Array>(
            reader,
            "RAINC"
        ),

        rainNonConvective: this.readVariable<Float32Array>(
            reader,
            "RAINNC"
        )

    };

}

}

