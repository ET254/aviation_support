import { WeatherData, Station } from "@prisma/client";
import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";

export class WindMapper {

    /**
     * ==========================================================
     * Map Wind Information
     * ==========================================================
     */
    static map(
        weather: WeatherData & { station?: Station },
        observation: CanonicalWeatherObservation
    ): void {

        observation.windDirection =
            weather.windDirection ?? 0;

        observation.windSpeed =
            weather.windSpeed ?? 0;

        observation.windGust =
            weather.gustSpeed ?? undefined;

        //--------------------------------------------------------
        // Variable Wind
        //--------------------------------------------------------

        observation.variableWind =
            observation.windDirection === 0 ||
            observation.windDirection === 999;

        //--------------------------------------------------------
        // Runway Components
        //--------------------------------------------------------

        if (observation.primaryRunwayHeading != null) {

            observation.crosswindComponent =
                this.calculateCrosswind(
                    observation.windSpeed,
                    observation.windDirection,
                    observation.primaryRunwayHeading
                );

            observation.headwindComponent =
                this.calculateHeadwind(
                    observation.windSpeed,
                    observation.windDirection,
                    observation.primaryRunwayHeading
                );

            observation.tailwindComponent =
                this.calculateTailwind(
                    observation.windSpeed,
                    observation.windDirection,
                    observation.primaryRunwayHeading
                );

        }

        //--------------------------------------------------------
        // Gust Factor
        //--------------------------------------------------------

        if (
            observation.windGust != null &&
            observation.windGust > observation.windSpeed
        ) {

            observation.windShearHeight = 0;

        }

        //--------------------------------------------------------
        // Low Level Wind Shear Indicator
        //--------------------------------------------------------

        observation.lowLevelWindShear =
            this.detectWindShear(observation);

    }

    /**
     * ==========================================================
     * Crosswind Component
     * ==========================================================
     */

    private static calculateCrosswind(

        windSpeed: number,

        windDirection: number,

        runwayHeading: number

    ): number {

        const angle =
            this.normalizeAngle(
                windDirection - runwayHeading
            );

        const component =
            windSpeed *
            Math.sin(this.toRadians(angle));

        return Number(
            Math.abs(component).toFixed(1)
        );

    }

    /**
     * ==========================================================
     * Headwind Component
     * ==========================================================
     */

    private static calculateHeadwind(

        windSpeed: number,

        windDirection: number,

        runwayHeading: number

    ): number {

        const angle =
            this.normalizeAngle(
                windDirection - runwayHeading
            );

        const component =
            windSpeed *
            Math.cos(this.toRadians(angle));

        return Number(component.toFixed(1));

    }

    /**
     * ==========================================================
     * Tailwind Component
     * ==========================================================
     */

    private static calculateTailwind(

        windSpeed: number,

        windDirection: number,

        runwayHeading: number

    ): number {

        const headwind =
            this.calculateHeadwind(
                windSpeed,
                windDirection,
                runwayHeading
            );

        return headwind < 0
            ? Number(Math.abs(headwind).toFixed(1))
            : 0;

    }

    /**
     * ==========================================================
     * Wind Shear Detection
     * ==========================================================
     */

    private static detectWindShear(

        observation: CanonicalWeatherObservation

    ): boolean {

        if (
            observation.windGust == null
        ) {

            return false;

        }

        const gustDifference =
            observation.windGust -
            observation.windSpeed;

        return gustDifference >= 15;

    }

    /**
     * ==========================================================
     * Convert Degrees to Radians
     * ==========================================================
     */

    private static toRadians(
        degrees: number
    ): number {

        return degrees * Math.PI / 180;

    }

    /**
     * ==========================================================
     * Normalize Angle
     * ==========================================================
     */

    private static normalizeAngle(
        angle: number
    ): number {

        angle %= 360;

        if (angle < -180)
            angle += 360;

        if (angle > 180)
            angle -= 360;

        return angle;

    }

}