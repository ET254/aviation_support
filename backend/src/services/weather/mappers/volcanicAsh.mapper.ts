import { WeatherData } from "@prisma/client";

import {
    CanonicalWeatherObservation
} from "../../../models/weather/CanonicalWeatherObservation";

export class VolcanicAshMapper {

    /**
     * ==========================================================
     * Map Volcanic Ash Parameters
     * ==========================================================
     */

    static map(
        weather: WeatherData,
        observation: CanonicalWeatherObservation
    ): void {

        //---------------------------------------------------------
        // Volcanic Ash
        //---------------------------------------------------------

        observation.volcanicAsh =
            this.detectVolcanicAsh(observation);

        //---------------------------------------------------------
        // Airport Operations
        //---------------------------------------------------------

        if (observation.volcanicAsh) {

            observation.airportOperational = false;

            observation.runwayOperational = false;

            observation.departuresAllowed = false;

            observation.arrivalsAllowed = false;

            observation.diversionRecommended = true;

            observation.alternateAirportRecommended = true;

            observation.holdingRecommended = false;

            observation.warningMessages ??= [];

            observation.warningMessages.push(
                "VOLCANIC ASH DETECTED - FLIGHT OPERATIONS SHOULD NOT CONTINUE."
            );

        }

    }

    /**
     * ==========================================================
     * Detect Volcanic Ash
     * ==========================================================
     */

    private static detectVolcanicAsh(
        wx: CanonicalWeatherObservation
    ): boolean {

        //---------------------------------------------------------
        // Existing observation
        //---------------------------------------------------------

        if (wx.volcanicAsh === true)
            return true;

        //---------------------------------------------------------
        // Raw METAR
        //---------------------------------------------------------

        if (
            wx.rawMETAR?.toUpperCase().includes("VA")
        ) {

            return true;

        }

        //---------------------------------------------------------
        // Raw SPECI
        //---------------------------------------------------------

        if (
            wx.rawSPECI?.toUpperCase().includes("VA")
        ) {

            return true;

        }

        //---------------------------------------------------------
        // Raw SIGMET
        //---------------------------------------------------------

        if (
            wx.rawSIGMET?.toUpperCase().includes("VA")
        ) {

            return true;

        }

        //---------------------------------------------------------
        // Warning messages
        //---------------------------------------------------------

        if (

            wx.warningMessages?.some(

                message =>

                    message.toUpperCase().includes("VOLCANIC") ||

                    message.toUpperCase().includes("ASH")

            )

        ) {

            return true;

        }

        //---------------------------------------------------------
        // No volcanic ash detected
        //---------------------------------------------------------

        return false;

    }

}