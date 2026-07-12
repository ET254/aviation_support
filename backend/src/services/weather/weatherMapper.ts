import { WeatherData, Station } from "@prisma/client";

import {
    CanonicalWeatherObservation
} from "../../models/weather/CanonicalWeatherObservation";

import { StationMapper } from "./mappers/station.mapper";
import { PressureMapper } from "./mappers/pressure.mapper";
import { TemperatureMapper } from "./mappers/temperature.mapper";
import { WindMapper } from "./mappers/wind.mapper";
import { VisibilityMapper } from "./mappers/visibility.mapper";
import { CloudMapper } from "./mappers/cloud.mapper";
import { PrecipitationMapper } from "./mappers/precipitation.mapper";
import { RunwayMapper } from "./mappers/runway.mapper";
import { DensityAltitudeMapper } from "./mappers/densityAltitude.mapper";
import { TurbulenceMapper } from "./mappers/turbulence.mapper";
import { IcingMapper } from "./mappers/icing.mapper";
import { ThunderstormMapper } from "./mappers/thunderstorm.mapper";
import { VolcanicAshMapper } from "./mappers/volcanicAsh.mapper";
import { FlightCategoryMapper } from "./mappers/flightCategory.mapper";
import { PerformanceMapper } from "./mappers/performance.mapper";
import { DerivedValuesMapper } from "./mappers/derivedValues.mapper";

export class WeatherMapper {

    static map(
        weather: WeatherData,
        station: Station
    ): CanonicalWeatherObservation {

        //----------------------------------------------------------
        // Start with station information
        //----------------------------------------------------------

        const observation: Partial<CanonicalWeatherObservation> = {

            ...StationMapper.map(station),

            observationId: weather.id,

            source: "METAR",

            observationType: "OBSERVED",

            timestamp: weather.timestamp,

            //------------------------------------------------------
            // Required fields with safe defaults
            //------------------------------------------------------

            temperature: weather.temperature ?? 0,

            dewPoint: weather.dewPoint ?? 0,

            qnh: weather.pressureQnh ?? 1013.25,

            windDirection: weather.windDirection ?? 0,

            windSpeed: weather.windSpeed ?? 0,

            visibility: weather.visibility ?? 9999

        };

        //----------------------------------------------------------
        // Complete the observation using all mappers
        //----------------------------------------------------------

        PressureMapper.map(weather, observation);

        TemperatureMapper.map(weather, observation);

        WindMapper.map(
            weather,
            observation as CanonicalWeatherObservation
        );

        VisibilityMapper.map(
            weather,
            observation as CanonicalWeatherObservation
        );

        CloudMapper.map(
            weather,
            observation as CanonicalWeatherObservation
        );

        PrecipitationMapper.map(
            weather,
            observation as CanonicalWeatherObservation
        );

        RunwayMapper.map(
            weather,
            observation as CanonicalWeatherObservation
        );

        DensityAltitudeMapper.map(
            weather,
            observation as CanonicalWeatherObservation
        );

        TurbulenceMapper.map(
            weather,
            observation as CanonicalWeatherObservation
        );

        IcingMapper.map(
            weather,
            observation as CanonicalWeatherObservation
        );

        ThunderstormMapper.map(
            weather,
            observation as CanonicalWeatherObservation
        );

        VolcanicAshMapper.map(
            weather,
            observation as CanonicalWeatherObservation
        );

        FlightCategoryMapper.map(
            observation as CanonicalWeatherObservation
        );

        PerformanceMapper.map(
            observation as CanonicalWeatherObservation
        );

        DerivedValuesMapper.map(
            observation as CanonicalWeatherObservation
        );

        //----------------------------------------------------------

        return observation as CanonicalWeatherObservation;

    }

}