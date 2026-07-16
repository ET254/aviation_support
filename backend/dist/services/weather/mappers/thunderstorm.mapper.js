"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThunderstormMapper = void 0;
class ThunderstormMapper {
    static map(weather, observation) {
        observation.thunderstorm =
            this.detectThunderstorm(observation);
        observation.lightning =
            this.detectLightning(observation);
        observation.hail =
            this.detectHail(observation);
        observation.squall =
            this.detectSquall(observation);
        observation.tornado =
            this.detectTornado(observation);
        observation.funnelCloud =
            this.detectFunnelCloud(observation);
    }
    static detectThunderstorm(wx) {
        return (wx.cumulonimbus === true ||
            wx.toweringCumulus === true ||
            wx.cloudLayers?.some(layer => layer.type === "CB") === true);
    }
    static detectLightning(wx) {
        return (wx.thunderstorm === true ||
            wx.cumulonimbus === true);
    }
    static detectHail(wx) {
        return (wx.precipitationType === "HAIL");
    }
    static detectSquall(wx) {
        return ((wx.windGust ?? 0) >= 35 &&
            wx.thunderstorm === true);
    }
    static detectTornado(wx) {
        return false;
    }
    static detectFunnelCloud(wx) {
        return false;
    }
}
exports.ThunderstormMapper = ThunderstormMapper;
//# sourceMappingURL=thunderstorm.mapper.js.map