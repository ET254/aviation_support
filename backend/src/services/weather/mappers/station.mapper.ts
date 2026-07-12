import { Station, TerrainType } from "@prisma/client";
import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";

export class StationMapper {

    /**
     * ==========================================================
     * Maps Station information into the Canonical Weather Model
     * ==========================================================
     */
    static map(
        station: Station
    ): Partial<CanonicalWeatherObservation> {

        return {

            stationId: station.id,

            stationCode: station.code,

            stationName: station.name,

            latitude: station.latitude,

            longitude: station.longitude,

            elevation: station.elevation,

            runwayLength: station.runwayLength ?? undefined,

            runwaySurface: station.runwaySurface ?? undefined,

            terrainType:
                station.terrainType as
                CanonicalWeatherObservation["terrainType"],

            runwayOrientation:
                station.runwayOrientation
                    ? Number(station.runwayOrientation)
                    : undefined

        };

    }

}