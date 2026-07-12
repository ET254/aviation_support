import { AviationMath } from "./aviationMath";

export class WeatherMath {

    /**
     * Relative Humidity (%)
     */
    static relativeHumidity(
        temperature: number,
        dewPoint: number
    ): number {

        const a = 17.625;
        const b = 243.04;

        const rh =
            100 *
            (
                Math.exp((a * dewPoint) / (b + dewPoint)) /
                Math.exp((a * temperature) / (b + temperature))
            );

        return AviationMath.clamp(rh, 0, 100);

    }

    /**
     * Dew Point from Temperature & RH
     */
    static dewPoint(
        temperature: number,
        humidity: number
    ): number {

        const a = 17.625;
        const b = 243.04;

        const alpha =
            Math.log(humidity / 100) +
            (a * temperature) /
            (b + temperature);

        return (b * alpha) / (a - alpha);

    }

    /**
     * Density Altitude (ft)
     */
    static densityAltitude(
        elevationFt: number,
        temperature: number,
        qnh: number
    ): number {

        const pressureAltitude =
            elevationFt +
            (1013.25 - qnh) * 30;

        const isaTemp =
            15 - (2 * elevationFt / 1000);

        return pressureAltitude +
            120 * (temperature - isaTemp);

    }

    /**
     * Pressure Altitude
     */
    static pressureAltitude(
        elevationFt: number,
        qnh: number
    ): number {

        return elevationFt +
            (1013.25 - qnh) * 30;

    }

    /**
     * ISA Temperature
     */
    static isaTemperature(
        elevationFt: number
    ): number {

        return 15 -
            (1.98 * elevationFt / 1000);

    }

    /**
     * Heat Index (°C)
     */
    static heatIndex(
        temperature: number,
        humidity: number
    ): number {

        const t =
            temperature * 9 / 5 + 32;

        const hi =
            -42.379 +
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

    /**
     * Wind Chill (°C)
     */
    static windChill(
        temperature: number,
        windSpeedKt: number
    ): number {

        const windKmh =
            windSpeedKt * 1.852;

        if (temperature > 10)
            return temperature;

        if (windKmh < 4.8)
            return temperature;

        return (
            13.12 +
            0.6215 * temperature -
            11.37 * Math.pow(windKmh, 0.16) +
            0.3965 *
            temperature *
            Math.pow(windKmh, 0.16)
        );

    }

    /**
     * Saturation Vapour Pressure
     */
    static saturationVaporPressure(
        temperature: number
    ): number {

        return 6.112 *
            Math.exp(
                (17.67 * temperature) /
                (temperature + 243.5)
            );

    }

    /**
     * Actual Vapour Pressure
     */
    static actualVaporPressure(
        temperature: number,
        humidity: number
    ): number {

        return (
            this.saturationVaporPressure(temperature) *
            humidity
        ) / 100;

    }

    /**
     * Virtual Temperature
     */
    static virtualTemperature(
        temperature: number,
        humidity: number,
        pressure: number
    ): number {

        const tempK =
            temperature + 273.15;

        const e =
            this.actualVaporPressure(
                temperature,
                humidity
            );

        return tempK /
            (1 - (0.378 * e / pressure));

    }

    /**
     * Cloud Ceiling (ft)
     */
    static cloudCeiling(
        cloudBaseMeters: number
    ): number {

        return cloudBaseMeters * 3.28084;

    }

    /**
     * Convert metres to feet
     */
    static metersToFeet(
        metres: number
    ): number {

        return metres * 3.28084;

    }

    /**
     * Convert feet to metres
     */
    static feetToMeters(
        feet: number
    ): number {

        return feet / 3.28084;

    }

    /**
     * Convert knots to km/h
     */
    static knotsToKmh(
        knots: number
    ): number {

        return knots * 1.852;

    }

    /**
     * Convert knots to m/s
     */
    static knotsToMetersPerSecond(
        knots: number
    ): number {

        return knots * 0.514444;

    }

    /**
     * Convert metres visibility to statute miles
     */
    static visibilityMiles(
        visibilityMeters: number
    ): number {

        return visibilityMeters / 1609.344;

    }

    /**
     * Fog likelihood
     */
    static fogProbability(
        temperature: number,
        dewPoint: number,
        windKt: number
    ): number {

        const spread =
            Math.abs(temperature - dewPoint);

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

        return AviationMath.clamp(
            probability,
            0,
            100
        );

    }

    /**
     * Thunderstorm likelihood
     */
    static thunderstormProbability(
        temperature: number,
        humidity: number,
        cloudAmount: number
    ): number {

        let score = 0;

        if (temperature >= 28)
            score += 30;

        if (humidity >= 75)
            score += 30;

        if (cloudAmount >= 6)
            score += 40;

        return AviationMath.clamp(score, 0, 100);

    }

    /**
     * Visibility category
     */
    static visibilityCategory(
        visibilityMeters: number
    ): string {

        if (visibilityMeters >= 10000)
            return "VMC";

        if (visibilityMeters >= 5000)
            return "Marginal VMC";

        if (visibilityMeters >= 1500)
            return "IMC";

        return "Low Visibility";

    }

    /**
     * Ceiling category
     */
    static ceilingCategory(
        ceilingFeet: number
    ): string {

        if (ceilingFeet >= 3000)
            return "VFR";

        if (ceilingFeet >= 1000)
            return "MVFR";

        if (ceilingFeet >= 500)
            return "IFR";

        return "LIFR";

    }

}