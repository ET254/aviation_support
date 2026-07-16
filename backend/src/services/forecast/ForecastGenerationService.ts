import path from "path";
import { AirportDefinition } from "./AirportRegistry";
import { NetCDFIngestionService } from "./NetCDFIngestionService";
import { VariableExtractor } from "./VariableExtractor";
import { AirportRegistry } from "./AirportRegistry";
import { CacheWriter } from "./CacheWriter";

import { ForecastMapper } from "../../adapters/ForecastMapper";

import { RawForecast } from "../../models/forecast/RawForecast";
import { Forecast } from "../../models/forecast/Forecast";

import { logger } from "../../utils/logger";

export class ForecastGenerationService {

    /**
     * ============================================================================
     * Generate forecasts for every airport from one WRF file
     * ============================================================================
     */

    static async generateFromWRF(
        wrfFilePath: string
    ): Promise<void> {

        logger.info(
            `Generating forecasts from ${wrfFilePath}`
        );

                /**
         * ============================================================================
         * Open the WRF NetCDF file
         * ============================================================================
         */

        const reader =
            await NetCDFIngestionService.open(
                wrfFilePath
            );

        /**
         * ============================================================================
         * Load all registered airports
         * ============================================================================
         */

        const airports =
            AirportRegistry.all();

        logger.info(
            `Loaded ${airports.length} airports`
        );

        /**
         * ============================================================================
         * Generate forecasts for every airport
         * ============================================================================
         */

        for (const airport of airports) {

            await this.generateAirportForecasts(

                airport,

                reader

            );

        }

        logger.info(
            "Forecast generation completed."
        );

    }

    /**
 * ============================================================================
 * Build Forecasts for One Airport
 * ============================================================================
 */

private static async generateAirportForecasts(

    airport: AirportDefinition,

    reader: NetCDFFile

): Promise<void> {

    logger.info(
        `Generating forecast for ${airport.stationCode}`
    );

    const rawForecasts = VariableExtractor.extractStationForecasts(
        reader,
        airport
    );

    const forecasts = ForecastMapper.fromMany(
        rawForecasts
    );

    await CacheWriter.writeForecast(
        airport.stationCode,
        forecasts
    );

    logger.info(
        `${airport.stationCode}: ${forecasts.length} forecast hours written`
    );

}

}