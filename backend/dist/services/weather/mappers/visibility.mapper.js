"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisibilityMapper = void 0;
class VisibilityMapper {
    static map(weather, observation) {
        observation.visibility =
            weather.visibility ?? 9999;
        observation.prevailingVisibility =
            observation.visibility;
        observation.minimumVisibility =
            observation.visibility;
        observation.rvr =
            weather.rvr ?? undefined;
        observation.runwayVisualRange =
            weather.rvr ?? undefined;
        observation.visibilityNorth =
            observation.visibility;
        observation.visibilitySouth =
            observation.visibility;
        observation.visibilityEast =
            observation.visibility;
        observation.visibilityWest =
            observation.visibility;
        observation.verticalVisibility =
            undefined;
        observation.obscurations = [];
        if (observation.fog)
            observation.obscurations.push("FG");
        if (observation.mist)
            observation.obscurations.push("BR");
        if (observation.haze)
            observation.obscurations.push("HZ");
        if (observation.smoke)
            observation.obscurations.push("FU");
        if (observation.blowingDust)
            observation.obscurations.push("BLDU");
        if (observation.blowingSand)
            observation.obscurations.push("BLSA");
        if (observation.blowingSnow)
            observation.obscurations.push("BLSN");
        observation.flightCategory =
            this.determineFlightCategory(observation.visibility, observation.ceiling);
    }
    static determineFlightCategory(visibility, ceiling) {
        const vis = visibility ?? 9999;
        const ceil = ceiling ?? 99999;
        if (vis < 800 ||
            ceil < 500) {
            return "LIFR";
        }
        if (vis < 3000 ||
            ceil < 1000) {
            return "IFR";
        }
        if (vis < 5000 ||
            ceil < 3000) {
            return "MVFR";
        }
        return "VFR";
    }
}
exports.VisibilityMapper = VisibilityMapper;
//# sourceMappingURL=visibility.mapper.js.map