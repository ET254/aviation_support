"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMapper = void 0;
class PerformanceMapper {
    static map(observation) {
        observation.pressureAltitude =
            this.calculatePressureAltitude(observation);
        if (observation.densityAltitude == null) {
            observation.densityAltitude =
                this.calculateDensityAltitude(observation);
        }
        observation.operationalReadinessIndex =
            this.calculateOperationalReadiness(observation);
        observation.flightRiskIndex =
            this.calculateFlightRisk(observation);
        observation.runwayRiskIndex =
            this.calculateRunwayRisk(observation);
        observation.weatherSeverityIndex =
            this.calculateWeatherSeverity(observation);
    }
    static calculatePressureAltitude(wx) {
        const elevation = wx.elevation ?? 0;
        const qnh = wx.qnh ?? 1013.25;
        return Math.round(elevation +
            (1013.25 - qnh) * 30);
    }
    static calculateDensityAltitude(wx) {
        const pressureAltitude = this.calculatePressureAltitude(wx);
        const isaTemp = 15 - (pressureAltitude / 1000) * 2;
        return Math.round(pressureAltitude +
            120 *
                (wx.temperature - isaTemp));
    }
    static calculateOperationalReadiness(wx) {
        let score = 100;
        if (wx.visibility < 5000)
            score -= 15;
        if ((wx.windSpeed ?? 0) > 25)
            score -= 15;
        if ((wx.windGust ?? 0) > 35)
            score -= 15;
        if (wx.thunderstorm)
            score -= 25;
        if (wx.icing)
            score -= 20;
        if (wx.turbulence)
            score -= 15;
        if (wx.volcanicAsh)
            score = 0;
        return Math.max(0, score);
    }
    static calculateFlightRisk(wx) {
        let score = 0;
        if (wx.visibility < 5000)
            score += 20;
        if ((wx.windSpeed ?? 0) > 20)
            score += 15;
        if ((wx.windGust ?? 0) > 30)
            score += 15;
        if (wx.thunderstorm)
            score += 25;
        if (wx.icing)
            score += 20;
        if (wx.turbulence)
            score += 15;
        if (wx.volcanicAsh)
            score = 100;
        return Math.min(100, score);
    }
    static calculateRunwayRisk(wx) {
        let score = 0;
        switch (wx.runwayCondition) {
            case "DAMP":
                score += 10;
                break;
            case "WET":
                score += 20;
                break;
            case "SLUSH":
                score += 40;
                break;
            case "SNOW":
                score += 50;
                break;
            case "ICE":
                score += 70;
                break;
        }
        if (wx.standingWater)
            score += 15;
        if ((wx.runwayFrictionCoefficient ?? 1) < 0.30) {
            score += 20;
        }
        return Math.min(score, 100);
    }
    static calculateWeatherSeverity(wx) {
        let severity = 0;
        if (wx.visibility < 1500)
            severity += 20;
        if ((wx.windSpeed ?? 0) > 30)
            severity += 20;
        if (wx.thunderstorm)
            severity += 20;
        if (wx.icing)
            severity += 15;
        if (wx.turbulence)
            severity += 10;
        if (wx.volcanicAsh)
            severity += 40;
        return Math.min(100, severity);
    }
}
exports.PerformanceMapper = PerformanceMapper;
//# sourceMappingURL=performance.mapper.js.map