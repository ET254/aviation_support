import { WeatherData } from "@prisma/client";
import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";

export class TemperatureMapper {

    static map(
        weather: WeatherData,
        observation: Partial<CanonicalWeatherObservation>
    ): void {

        //--------------------------------------------------
        // Raw values
        //--------------------------------------------------

        observation.temperature =
            weather.temperature ?? 15;

        observation.dewPoint =
            weather.dewPoint ?? (
                observation.temperature - 2
            );

        //--------------------------------------------------
        // Relative Humidity
        //--------------------------------------------------

        observation.relativeHumidity =
            this.calculateRelativeHumidity(
                observation.temperature,
                observation.dewPoint
            );

        //--------------------------------------------------
        // Wet Bulb Temperature
        //--------------------------------------------------

        observation.wetBulbTemperature =
            this.calculateWetBulbTemperature(
                observation.temperature,
                observation.relativeHumidity
            );

        //--------------------------------------------------
        // Pressure Altitude
        //--------------------------------------------------

        observation.pressureAltitude =
            weather.densityAltitude != null
                ? weather.densityAltitude
                : undefined;

        //--------------------------------------------------
        // Density Altitude
        //--------------------------------------------------

        observation.densityAltitude =
            weather.densityAltitude ??
            this.calculateDensityAltitude(
                observation.temperature,
                weather.pressureQnh ?? 1013.25,
                observation.elevation ?? 0
            );

        //--------------------------------------------------
        // Heat Index
        //--------------------------------------------------

        observation.heatIndex =
            this.calculateHeatIndex(
                observation.temperature,
                observation.relativeHumidity
            );

        //--------------------------------------------------
        // Wind Chill
        //--------------------------------------------------

        observation.windChill =
            this.calculateWindChill(
                observation.temperature,
                weather.windSpeed ?? 0
            );

        //--------------------------------------------------
        // Freezing Level
        //--------------------------------------------------

        observation.freezingLevel =
            this.calculateFreezingLevel(
                observation.temperature,
                observation.elevation ?? 0
            );

    }

    //--------------------------------------------------
    // Relative Humidity
    //--------------------------------------------------

    private static calculateRelativeHumidity(
        temperature: number,
        dewPoint: number
    ): number {

        const a = 17.625;
        const b = 243.04;

        const rh =
            100 *
            Math.exp(
                (a * dewPoint) / (b + dewPoint) -
                (a * temperature) / (b + temperature)
            );

        return Math.max(
            0,
            Math.min(100, Math.round(rh))
        );

    }

    //--------------------------------------------------
    // Wet Bulb
    //--------------------------------------------------

    private static calculateWetBulbTemperature(
        temperature: number,
        humidity: number
    ): number {

        const tw =
            temperature *
                Math.atan(
                    0.151977 *
                    Math.sqrt(humidity + 8.313659)
                )
            +
            Math.atan(temperature + humidity)
            -
            Math.atan(humidity - 1.676331)
            +
            0.00391838 *
                Math.pow(humidity, 1.5) *
                Math.atan(
                    0.023101 * humidity
                )
            -
            4.686035;

        return Number(tw.toFixed(1));

    }

    //--------------------------------------------------
    // Density Altitude
    //--------------------------------------------------

    private static calculateDensityAltitude(
        temperature: number,
        qnh: number,
        elevation: number
    ): number {

        const pressureAltitude =
            elevation +
            (1013.25 - qnh) * 30;

        const isaTemp =
            15 -
            (2 * pressureAltitude / 1000);

        return Math.round(
            pressureAltitude +
            120 *
            (temperature - isaTemp)
        );

    }

    //--------------------------------------------------
    // Heat Index
    //--------------------------------------------------

    private static calculateHeatIndex(
        temperature: number,
        humidity: number
    ): number {

        if (
            temperature < 27 ||
            humidity < 40
        ) {

            return temperature;

        }

        const T =
            temperature * 9 / 5 + 32;

        const R = humidity;

        const HI =
            -42.379 +
            2.04901523 * T +
            10.14333127 * R -
            0.22475541 * T * R -
            6.83783e-3 * T * T -
            5.481717e-2 * R * R +
            1.22874e-3 * T * T * R +
            8.5282e-4 * T * R * R -
            1.99e-6 * T * T * R * R;

        return Number(
            (((HI - 32) * 5 / 9).toFixed(1))
        );

    }

    //--------------------------------------------------
    // Wind Chill
    //--------------------------------------------------

    private static calculateWindChill(
        temperature: number,
        windSpeed: number
    ): number {

        if (
            temperature > 10 ||
            windSpeed < 5
        ) {

            return temperature;

        }

        return Number(

            (
                13.12 +
                0.6215 * temperature -
                11.37 *
                Math.pow(windSpeed, 0.16) +
                0.3965 *
                temperature *
                Math.pow(windSpeed, 0.16)

            ).toFixed(1)

        );

    }

    //--------------------------------------------------
    // Freezing Level Estimate
    //--------------------------------------------------

    private static calculateFreezingLevel(
        temperature: number,
        elevation: number
    ): number {

        const lapseRate =
            2;

        const altitudeIncrease =
            (temperature / lapseRate) *
            1000;

        return Math.max(
            0,
            Math.round(
                elevation + altitudeIncrease
            )
        );

    }

}