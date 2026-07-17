"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PressureMapper = void 0;
class PressureMapper {
    static map(weather, observation) {
        observation.qnh =
            weather.pressureQnh ?? 1013.25;
        observation.qfe =
            weather.pressureQfe ?? undefined;
        observation.altimeter =
            weather.pressureQnh != null
                ? this.qnhToAltimeter(weather.pressureQnh)
                : undefined;
        observation.pressureTendency =
            undefined;
    }
    static qnhToAltimeter(qnh) {
        return Number((qnh * 0.0295299830714).toFixed(2));
    }
}
exports.PressureMapper = PressureMapper;
//# sourceMappingURL=pressure.mapper.js.map