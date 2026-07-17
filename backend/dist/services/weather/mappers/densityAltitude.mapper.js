"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DensityAltitudeMapper = void 0;
class DensityAltitudeMapper {
    static map(weather, observation) {
        observation.pressureAltitude =
            this.calculatePressureAltitude(observation);
        observation.densityAltitude =
            weather.densityAltitude ??
                this.calculateDensityAltitude(observation);
        observation.densityIndex =
            this.calculateDensityIndex(observation.densityAltitude);
        observation.departuresAllowed =
            observation.densityAltitude < 9000;
        observation.operationalReadinessIndex =
            this.operationalReadiness(observation.densityAltitude);
    }
    static calculatePressureAltitude(wx) {
        const elevation = wx.elevation ?? 0;
        return Math.round(elevation +
            (1013.25 - wx.qnh) * 30);
    }
    static calculateDensityAltitude(wx) {
        const pressureAltitude = wx.pressureAltitude ??
            this.calculatePressureAltitude(wx);
        const elevation = wx.elevation ?? 0;
        const isaTemperature = 15 -
            (elevation / 1000) * 2;
        const da = pressureAltitude +
            120 *
                (wx.temperature - isaTemperature);
        return Math.round(da);
    }
    static calculateDensityIndex(densityAltitude) {
        if (densityAltitude == null)
            return 0;
        if (densityAltitude <= 0)
            return 0;
        if (densityAltitude >= 12000)
            return 100;
        return Math.round(densityAltitude / 120);
    }
    static operationalReadiness(densityAltitude) {
        if (densityAltitude == null)
            return 100;
        if (densityAltitude <= 2000)
            return 100;
        if (densityAltitude <= 4000)
            return 90;
        if (densityAltitude <= 6000)
            return 75;
        if (densityAltitude <= 8000)
            return 55;
        if (densityAltitude <= 10000)
            return 35;
        return 15;
    }
}
exports.DensityAltitudeMapper = DensityAltitudeMapper;
//# sourceMappingURL=densityAltitude.mapper.js.map