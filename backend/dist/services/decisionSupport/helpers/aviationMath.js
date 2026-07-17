"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AviationMath = void 0;
class AviationMath {
    static toRadians(degrees) {
        return (degrees * Math.PI) / 180;
    }
    static toDegrees(radians) {
        return (radians * 180) / Math.PI;
    }
    static normalizeHeading(heading) {
        let h = heading % 360;
        if (h < 0) {
            h += 360;
        }
        return h;
    }
    static angleDifference(a, b) {
        const diff = Math.abs(this.normalizeHeading(a) -
            this.normalizeHeading(b));
        return diff > 180 ? 360 - diff : diff;
    }
    static calculateCrosswind(windDirection, windSpeed, runwayHeading) {
        const angle = this.toRadians(this.angleDifference(windDirection, runwayHeading));
        return windSpeed * Math.sin(angle);
    }
    static calculateHeadwind(windDirection, windSpeed, runwayHeading) {
        const angle = this.toRadians(this.angleDifference(windDirection, runwayHeading));
        return windSpeed * Math.cos(angle);
    }
    static calculateTailwind(windDirection, windSpeed, runwayHeading) {
        const hw = this.calculateHeadwind(windDirection, windSpeed, runwayHeading);
        return hw < 0 ? Math.abs(hw) : 0;
    }
    static calculatePressureAltitude(elevationFeet, qnh) {
        return elevationFeet + ((1013.25 - qnh) * 30);
    }
    static calculateDensityAltitude(elevationFeet, temperature, qnh) {
        const pressureAltitude = this.calculatePressureAltitude(elevationFeet, qnh);
        const isaTemperature = 15 - (pressureAltitude / 1000) * 2;
        return pressureAltitude +
            (120 * (temperature - isaTemperature));
    }
    static saturationVaporPressure(temperature) {
        return 6.112 *
            Math.exp((17.67 * temperature) /
                (temperature + 243.5));
    }
    static calculateRelativeHumidity(temperature, dewPoint) {
        const es = this.saturationVaporPressure(temperature);
        const e = this.saturationVaporPressure(dewPoint);
        return (e / es) * 100;
    }
    static dewPointSpread(temperature, dewPoint) {
        return temperature - dewPoint;
    }
    static celsiusToKelvin(temperature) {
        return temperature + 273.15;
    }
    static knotsToMetersPerSecond(knots) {
        return knots * 0.514444;
    }
    static metersPerSecondToKnots(ms) {
        return ms / 0.514444;
    }
    static nauticalMilesToKm(nm) {
        return nm * 1.852;
    }
    static kmToNauticalMiles(km) {
        return km / 1.852;
    }
    static feetToMeters(feet) {
        return feet * 0.3048;
    }
    static metersToFeet(meters) {
        return meters / 0.3048;
    }
    static determineFlightCategory(visibility, cloudBase) {
        if (visibility < 800 ||
            cloudBase < 200) {
            return "LIFR";
        }
        if (visibility < 3000 ||
            cloudBase < 500) {
            return "IFR";
        }
        if (visibility < 5000 ||
            cloudBase < 1000) {
            return "MVFR";
        }
        return "VFR";
    }
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
}
exports.AviationMath = AviationMath;
//# sourceMappingURL=aviationMath.js.map