import fs from "fs/promises";
import path from "path";

import { Forecast } from "../models/forecast";
import { logger } from "../utils/logger";
export class NetCDFAdapter {

    /**
     * Location of extracted forecast cache.
     */
    private static readonly CACHE_DIRECTORY = path.join(
        process.cwd(),
        "data",
        "forecast",
        "cache"
    );

    /**
 * Ensure cache directory exists.
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
     * Load forecasts for a station.
     */
    static async loadStationForecast(
        stationCode: string
    ): Promise<Forecast[]> {
        await this.ensureCacheDirectory();

logger.info(
    `Loading forecast cache for ${stationCode}`
);

        const file = path.join(
            this.CACHE_DIRECTORY,
            `${stationCode}.json`
        );

        try {

            const content = await fs.readFile(file, "utf-8");

            const forecasts: Forecast[] =
    JSON.parse(content);

return forecasts.sort(
    (a, b) =>
        a.forecastHour -
        b.forecastHour
);

        } catch {

            return [];

        }

    }

    /**
     * Return latest forecast.
     */
    static async latestForecast(
        stationCode: string
    ): Promise<Forecast | null> {

        const forecasts = await this.loadStationForecast(
            stationCode
        );

        if (forecasts.length === 0) {

            return null;

        }

        return forecasts[0];

    }

    /**
     * Forecast by forecast hour.
     */
    static async forecastHour(

        stationCode: string,

        hour: number

    ): Promise<Forecast | null> {

        const forecasts = await this.loadStationForecast(
            stationCode
        );

        const result = forecasts.find(

            forecast => forecast.forecastHour === hour

        );

        return result ?? null;

    }

    /**
     * Entire forecast timeline.
     */
    static async timeline(

        stationCode: string

    ): Promise<Forecast[]> {

        return this.loadStationForecast(

            stationCode

        );

    }

}