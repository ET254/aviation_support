"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherMapper = void 0;
const station_mapper_1 = require("./mappers/station.mapper");
const pressure_mapper_1 = require("./mappers/pressure.mapper");
const temperature_mapper_1 = require("./mappers/temperature.mapper");
const wind_mapper_1 = require("./mappers/wind.mapper");
const visibility_mapper_1 = require("./mappers/visibility.mapper");
const cloud_mapper_1 = require("./mappers/cloud.mapper");
const precipitation_mapper_1 = require("./mappers/precipitation.mapper");
const runway_mapper_1 = require("./mappers/runway.mapper");
const densityAltitude_mapper_1 = require("./mappers/densityAltitude.mapper");
const turbulence_mapper_1 = require("./mappers/turbulence.mapper");
const icing_mapper_1 = require("./mappers/icing.mapper");
const thunderstorm_mapper_1 = require("./mappers/thunderstorm.mapper");
const volcanicAsh_mapper_1 = require("./mappers/volcanicAsh.mapper");
const flightCategory_mapper_1 = require("./mappers/flightCategory.mapper");
const performance_mapper_1 = require("./mappers/performance.mapper");
const derivedValues_mapper_1 = require("./mappers/derivedValues.mapper");
class WeatherMapper {
    static map(weather, station) {
        const observation = {
            ...station_mapper_1.StationMapper.map(station),
            observationId: weather.id,
            source: "METAR",
            observationType: "OBSERVED",
            timestamp: weather.timestamp,
            temperature: weather.temperature ?? 0,
            dewPoint: weather.dewPoint ?? 0,
            qnh: weather.pressureQnh ?? 1013.25,
            windDirection: weather.windDirection ?? 0,
            windSpeed: weather.windSpeed ?? 0,
            visibility: weather.visibility ?? 9999
        };
        pressure_mapper_1.PressureMapper.map(weather, observation);
        temperature_mapper_1.TemperatureMapper.map(weather, observation);
        wind_mapper_1.WindMapper.map(weather, observation);
        visibility_mapper_1.VisibilityMapper.map(weather, observation);
        cloud_mapper_1.CloudMapper.map(weather, observation);
        precipitation_mapper_1.PrecipitationMapper.map(weather, observation);
        runway_mapper_1.RunwayMapper.map(weather, observation);
        densityAltitude_mapper_1.DensityAltitudeMapper.map(weather, observation);
        turbulence_mapper_1.TurbulenceMapper.map(weather, observation);
        icing_mapper_1.IcingMapper.map(weather, observation);
        thunderstorm_mapper_1.ThunderstormMapper.map(weather, observation);
        volcanicAsh_mapper_1.VolcanicAshMapper.map(weather, observation);
        flightCategory_mapper_1.FlightCategoryMapper.map(observation);
        performance_mapper_1.PerformanceMapper.map(observation);
        derivedValues_mapper_1.DerivedValuesMapper.map(observation);
        return observation;
    }
}
exports.WeatherMapper = WeatherMapper;
//# sourceMappingURL=weatherMapper.js.map