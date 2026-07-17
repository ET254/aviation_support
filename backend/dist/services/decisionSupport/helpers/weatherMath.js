"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherMath = void 0;
const aviationMath_1 = require("./aviationMath");
class WeatherMath {
    static relativeHumidity(temperature, dewPoint) {
        const a = 17.625;
        const b = 243.04;
        const rh = 100 *
            (Math.exp((a * dewPoint) / (b + dewPoint)) /
                Math.exp((a * temperature) / (b + temperature)));
        return aviationMath_1.AviationMath.clamp(rh, 0, 100);
    }
    static dewPoint(temperature, humidity) {
        const a = 17.625;
        const b = 243.04;
        const alpha = Math.log(humidity / 100) +
            (a * temperature) /
                (b + temperature);
        return (b * alpha) / (a - alpha);
    }
    static densityAltitude(elevationFt, temperature, qnh) {
        const pressureAltitude = elevationFt +
            (1013.25 - qnh) * 30;
        const isaTemp = 15 - (2 * elevationFt / 1000);
        return pressureAltitude +
            120 * (temperature - isaTemp);
    }
    static pressureAltitude(elevationFt, qnh) {
        return elevationFt +
            (1013.25 - qnh) * 30;
    }
    static isaTemperature(elevationFt) {
        return 15 -
            (1.98 * elevationFt / 1000);
    }
    static heatIndex(temperature, humidity) {
        const t = temperature * 9 / 5 + 32;
        const hi = -42.379 +
            2.04901523 * t +
            10.14333127 * humidity -
            0.22475541 * t * humidity -
            0.00683783 * t * t -
            0.05481717 * humidity * humidity +
            0.00122874 * t * t * humidity +
            0.00085282 * t * humidity * humidity -
            0.00000199 * t * t * humidity * humidity;
        return (hi - 32) * 5 / 9;
    }
    static windChill(temperature, windSpeedKt) {
        const windKmh = windSpeedKt * 1.852;
        if (temperature > 10)
            return temperature;
        if (windKmh < 4.8)
            return temperature;
        return (13.12 +
            0.6215 * temperature -
            11.37 * Math.pow(windKmh, 0.16) +
            0.3965 *
                temperature *
                Math.pow(windKmh, 0.16));
    }
    static saturationVaporPressure(temperature) {
        return 6.112 *
            Math.exp((17.67 * temperature) /
                (temperature + 243.5));
    }
    static actualVaporPressure(temperature, humidity) {
        return (this.saturationVaporPressure(temperature) *
            humidity) / 100;
    }
    static virtualTemperature(temperature, humidity, pressure) {
        const tempK = temperature + 273.15;
        const e = this.actualVaporPressure(temperature, humidity);
        return tempK /
            (1 - (0.378 * e / pressure));
    }
    static cloudCeiling(cloudBaseMeters) {
        return cloudBaseMeters * 3.28084;
    }
    static metersToFeet(metres) {
        return metres * 3.28084;
    }
    static feetToMeters(feet) {
        return feet / 3.28084;
    }
    static knotsToKmh(knots) {
        return knots * 1.852;
    }
    static knotsToMetersPerSecond(knots) {
        return knots * 0.514444;
    }
    static visibilityMiles(visibilityMeters) {
        return visibilityMeters / 1609.344;
    }
    static fogProbability(temperature, dewPoint, windKt) {
        const spread = Math.abs(temperature - dewPoint);
        let probability = 0;
        if (spread <= 1)
            probability += 60;
        else if (spread <= 2)
            probability += 40;
        else if (spread <= 4)
            probability += 20;
        if (windKt < 5)
            probability += 25;
        if (windKt < 2)
            probability += 15;
        return aviationMath_1.AviationMath.clamp(probability, 0, 100);
    }
    static thunderstormProbability(temperature, humidity, cloudAmount) {
        let score = 0;
        if (temperature >= 28)
            score += 30;
        if (humidity >= 75)
            score += 30;
        if (cloudAmount >= 6)
            score += 40;
        return aviationMath_1.AviationMath.clamp(score, 0, 100);
    }
    static visibilityCategory(visibilityMeters) {
        if (visibilityMeters >= 10000)
            return "VMC";
        if (visibilityMeters >= 5000)
            return "Marginal VMC";
        if (visibilityMeters >= 1500)
            return "IMC";
        return "Low Visibility";
    }
    static ceilingCategory(ceilingFeet) {
        if (ceilingFeet >= 3000)
            return "VFR";
        if (ceilingFeet >= 1000)
            return "MVFR";
        if (ceilingFeet >= 500)
            return "IFR";
        return "LIFR";
    }
}
exports.WeatherMath = WeatherMath;
//# sourceMappingURL=weatherMath.js.map