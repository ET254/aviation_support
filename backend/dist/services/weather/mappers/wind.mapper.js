"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindMapper = void 0;
class WindMapper {
    static map(weather, observation) {
        observation.windDirection =
            weather.windDirection ?? 0;
        observation.windSpeed =
            weather.windSpeed ?? 0;
        observation.windGust =
            weather.gustSpeed ?? undefined;
        observation.variableWind =
            observation.windDirection === 0 ||
                observation.windDirection === 999;
        if (observation.primaryRunwayHeading != null) {
            observation.crosswindComponent =
                this.calculateCrosswind(observation.windSpeed, observation.windDirection, observation.primaryRunwayHeading);
            observation.headwindComponent =
                this.calculateHeadwind(observation.windSpeed, observation.windDirection, observation.primaryRunwayHeading);
            observation.tailwindComponent =
                this.calculateTailwind(observation.windSpeed, observation.windDirection, observation.primaryRunwayHeading);
        }
        if (observation.windGust != null &&
            observation.windGust > observation.windSpeed) {
            observation.windShearHeight = 0;
        }
        observation.lowLevelWindShear =
            this.detectWindShear(observation);
    }
    static calculateCrosswind(windSpeed, windDirection, runwayHeading) {
        const angle = this.normalizeAngle(windDirection - runwayHeading);
        const component = windSpeed *
            Math.sin(this.toRadians(angle));
        return Number(Math.abs(component).toFixed(1));
    }
    static calculateHeadwind(windSpeed, windDirection, runwayHeading) {
        const angle = this.normalizeAngle(windDirection - runwayHeading);
        const component = windSpeed *
            Math.cos(this.toRadians(angle));
        return Number(component.toFixed(1));
    }
    static calculateTailwind(windSpeed, windDirection, runwayHeading) {
        const headwind = this.calculateHeadwind(windSpeed, windDirection, runwayHeading);
        return headwind < 0
            ? Number(Math.abs(headwind).toFixed(1))
            : 0;
    }
    static detectWindShear(observation) {
        if (observation.windGust == null) {
            return false;
        }
        const gustDifference = observation.windGust -
            observation.windSpeed;
        return gustDifference >= 15;
    }
    static toRadians(degrees) {
        return degrees * Math.PI / 180;
    }
    static normalizeAngle(angle) {
        angle %= 360;
        if (angle < -180)
            angle += 360;
        if (angle > 180)
            angle -= 360;
        return angle;
    }
}
exports.WindMapper = WindMapper;
//# sourceMappingURL=wind.mapper.js.map