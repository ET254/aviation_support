"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TurbulenceMapper = void 0;
class TurbulenceMapper {
    static map(weather, observation) {
        observation.turbulence =
            this.detectTurbulence(observation);
        observation.turbulenceSeverity =
            this.determineSeverity(observation);
        observation.turbulenceBase =
            this.estimateBase(observation);
        observation.turbulenceTop =
            this.estimateTop(observation);
        observation.clearAirTurbulence =
            this.detectCAT(observation);
        observation.mountainWave =
            this.detectMountainWave(observation);
        observation.rotorCloud =
            observation.mountainWave &&
                observation.cloudBase != null &&
                observation.cloudBase < 6000;
    }
    static detectTurbulence(wx) {
        if ((wx.windGust ?? 0) >= 20)
            return true;
        if ((wx.crosswindComponent ?? 0) >= 20)
            return true;
        if (wx.lowLevelWindShear)
            return true;
        if (wx.thunderstorm)
            return true;
        if (wx.cumulonimbus)
            return true;
        return false;
    }
    static determineSeverity(wx) {
        let score = 0;
        score += wx.windGust ?? 0;
        score += (wx.crosswindComponent ?? 0) * 0.5;
        if (wx.lowLevelWindShear)
            score += 20;
        if (wx.thunderstorm)
            score += 30;
        if (wx.cumulonimbus)
            score += 20;
        if (score < 20)
            return "NONE";
        if (score < 40)
            return "LIGHT";
        if (score < 60)
            return "MODERATE";
        if (score < 85)
            return "SEVERE";
        return "EXTREME";
    }
    static estimateBase(wx) {
        if (wx.lowLevelWindShear)
            return 500;
        if (wx.cloudBase)
            return wx.cloudBase;
        return undefined;
    }
    static estimateTop(wx) {
        if (wx.cumulonimbus)
            return 45000;
        if (wx.cloudTop)
            return wx.cloudTop;
        if (wx.cloudBase)
            return wx.cloudBase + 5000;
        return undefined;
    }
    static detectCAT(wx) {
        return ((wx.jetStreamSpeed ?? 0) >= 80 &&
            !wx.thunderstorm &&
            !wx.cumulonimbus);
    }
    static detectMountainWave(wx) {
        const elevation = wx.elevation ?? 0;
        return (elevation >= 5000 &&
            wx.windSpeed >= 25);
    }
}
exports.TurbulenceMapper = TurbulenceMapper;
//# sourceMappingURL=turbulence.mapper.js.map