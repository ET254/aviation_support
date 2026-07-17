"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IcingMapper = void 0;
class IcingMapper {
    static map(weather, observation) {
        observation.icing =
            this.detectIcing(observation);
        observation.icingSeverity =
            this.determineSeverity(observation);
        observation.icingBase =
            this.determineBase(observation);
        observation.icingTop =
            this.determineTop(observation);
        observation.supercooledLiquidWater =
            this.detectSLW(observation);
        observation.freezingRain =
            this.detectFreezingRain(observation);
        observation.freezingDrizzle =
            this.detectFreezingDrizzle(observation);
        observation.deicingRequired =
            observation.icing ||
                observation.freezingRain ||
                observation.freezingDrizzle;
    }
    static detectIcing(wx) {
        const temperatureSuitable = wx.temperature <= 5 &&
            wx.temperature >= -20;
        const moisturePresent = (wx.relativeHumidity ?? 0) >= 80 ||
            wx.cloudAmount != null ||
            wx.precipitationType !== undefined ||
            wx.fog === true ||
            wx.mist === true;
        return temperatureSuitable && moisturePresent;
    }
    static determineSeverity(wx) {
        let score = 0;
        if (wx.temperature <= 0)
            score += 20;
        if ((wx.relativeHumidity ?? 0) >= 90)
            score += 20;
        if (wx.supercooledLiquidWater)
            score += 25;
        if (wx.freezingRain)
            score += 35;
        if (wx.freezingDrizzle)
            score += 15;
        if (wx.cloudAmount != null)
            score += 10;
        if (score == 0)
            return "NONE";
        if (score < 25)
            return "LIGHT";
        if (score < 50)
            return "MODERATE";
        if (score < 75)
            return "SEVERE";
        return "EXTREME";
    }
    static determineBase(wx) {
        if (wx.cloudBase != null)
            return wx.cloudBase;
        if (wx.freezingLevel != null)
            return wx.freezingLevel;
        return undefined;
    }
    static determineTop(wx) {
        if (wx.cloudTop != null)
            return wx.cloudTop;
        if (wx.cloudBase != null)
            return wx.cloudBase + 8000;
        if (wx.freezingLevel != null)
            return wx.freezingLevel + 8000;
        return undefined;
    }
    static detectSLW(wx) {
        return (wx.temperature < 0 &&
            wx.temperature > -20 &&
            (wx.relativeHumidity ?? 0) >= 90 &&
            wx.precipitationType === "RAIN");
    }
    static detectFreezingRain(wx) {
        return (wx.temperature <= 0 &&
            wx.precipitationType === "FREEZING_RAIN");
    }
    static detectFreezingDrizzle(wx) {
        return (wx.temperature <= 0 &&
            wx.precipitationType === "FREEZING_DRIZZLE");
    }
}
exports.IcingMapper = IcingMapper;
//# sourceMappingURL=icing.mapper.js.map