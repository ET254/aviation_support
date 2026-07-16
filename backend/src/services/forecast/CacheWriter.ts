import fs from "fs/promises";
import path from "path";

import { Forecast } from "../../models/forecast";

/**
 * ============================================================================
 * Cache Writer
 *
 * Saves processed forecasts into the cache directory.
 * ============================================================================
 */

export class CacheWriter {

    private static readonly CACHE_DIRECTORY = path.join(

        process.cwd(),

        "data",

        "forecast",

        "cache"

    );

    /**
 * ============================================================================
 * Ensure Cache Directory Exists
 * ============================================================================
 */

private static async ensureDirectory(): Promise<void> {

    await fs.mkdir(

        this.CACHE_DIRECTORY,

        {

            recursive: true

        }

    );

}

/**
 * ============================================================================
 * Save Station Forecast
 * ============================================================================
 */

static async saveStationForecast(

    stationCode: string,

    forecasts: Forecast[]

): Promise<void> {

    await this.ensureDirectory();

    const file = path.join(

        this.CACHE_DIRECTORY,

        `${stationCode}.json`

    );

    await fs.writeFile(

        file,

        JSON.stringify(

            forecasts,

            null,

            2

        ),

        "utf8"

    );

}

/**
 * ============================================================================
 * Save Multiple Stations
 * ============================================================================
 */

static async saveAll(

    forecasts: Record<string, Forecast[]>

): Promise<void> {

    await this.ensureDirectory();

    for (

        const [

            station,

            stationForecast

        ]

        of Object.entries(forecasts)

    ) {

        await this.saveStationForecast(

            station,

            stationForecast

        );

    }

}

/**
 * ============================================================================
 * Read Cached Forecast
 * ============================================================================
 */

static async readStationForecast(

    stationCode: string

): Promise<Forecast[]> {

    const file = path.join(

        this.CACHE_DIRECTORY,

        `${stationCode}.json`

    );

    try {

        const data = await fs.readFile(

            file,

            "utf8"

        );

        return JSON.parse(data);

    }

    catch {

        return [];

    }

}

/**
 * ============================================================================
 * Cache Exists
 * ============================================================================
 */

static async exists(

    stationCode: string

): Promise<boolean> {

    const file = path.join(

        this.CACHE_DIRECTORY,

        `${stationCode}.json`

    );

    try {

        await fs.access(file);

        return true;

    }

    catch {

        return false;

    }

}

/**
 * ============================================================================
 * Clear Cache
 * ============================================================================
 */

static async clear(): Promise<void> {

    await fs.rm(

        this.CACHE_DIRECTORY,

        {

            recursive: true,

            force: true

        }

    );

}

}