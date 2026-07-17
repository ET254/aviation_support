"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrecipitationMapper = void 0;
const client_1 = require("@prisma/client");
class PrecipitationMapper {
    static map(weather, observation) {
        observation.precipitationType =
            this.mapType(weather.precipitationType);
        observation.precipitationIntensity =
            this.mapIntensity(weather.precipitationIntensity);
        observation.precipitationRate =
            weather.precipitationIntensity ?? undefined;
        observation.accumulation =
            undefined;
        observation.hail =
            weather.precipitationType ===
                client_1.PrecipitationType.HAIL;
        observation.freezingRain =
            weather.precipitationType ===
                client_1.PrecipitationType.FREEZING_RAIN;
        observation.freezingDrizzle =
            false;
        observation.snowDepth ??= 0;
        observation.slushDepth ??= 0;
    }
    static mapType(type) {
        if (!type)
            return "NONE";
        switch (type) {
            case client_1.PrecipitationType.NONE:
                return "NONE";
            case client_1.PrecipitationType.RAIN:
                return "RAIN";
            case client_1.PrecipitationType.SNOW:
                return "SNOW";
            case client_1.PrecipitationType.SLEET:
                return "SLEET";
            case client_1.PrecipitationType.HAIL:
                return "HAIL";
            case client_1.PrecipitationType.FREEZING_RAIN:
                return "FREEZING_RAIN";
            default:
                return "NONE";
        }
    }
    static mapIntensity(intensity) {
        if (intensity == null ||
            intensity <= 0) {
            return "NONE";
        }
        if (intensity < 2)
            return "LIGHT";
        if (intensity < 8)
            return "MODERATE";
        if (intensity < 20)
            return "HEAVY";
        return "VIOLENT";
    }
}
exports.PrecipitationMapper = PrecipitationMapper;
//# sourceMappingURL=precipitation.mapper.js.map