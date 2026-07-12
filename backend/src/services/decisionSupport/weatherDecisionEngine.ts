import { CanonicalWeatherObservation } from "../../models/weather/CanonicalWeatherObservation";
import { VisibilityRules } from "./rules/visibility.rules";
import { WindRules } from "./rules/wind.rules";
import { RunwayRules } from "./rules/runway.rules";
import { CloudRules } from "./rules/cloud.rules";
import { IcingRules } from "./rules/icing.rules";
import { TurbulenceRules } from "./rules/turbulence.rules";
import { ThunderstormRules } from "./rules/thunderstorm.rules";
import { PrecipitationRules } from "./rules/precipitation.rules";
import { DensityAltitudeRules } from "./rules/densityAltitude.rules";
import { VolcanicAshRules } from "./rules/volcanicAsh.rules";
import {
    PilotRecommendation
} from "./recommendations/pilotRecommendations";

import {
    ATCRecommendation
} from "./recommendations/atcRecommendations";

import {
    DispatcherRecommendation
} from "./recommendations/dispatcherRecommendations";

import {
    AirportRecommendation
} from "./recommendations/airportRecommendations";
import { PilotRecommendations } from "./recommendations/pilotRecommendations";
import { ATCRecommendations } from "./recommendations/atcRecommendations";
import { DispatcherRecommendations } from "./recommendations/dispatcherRecommendations";
import { AirportRecommendations } from "./recommendations/airportRecommendations";

export interface WeatherDecision {

    observation: CanonicalWeatherObservation;

    visibility: ReturnType<typeof VisibilityRules.evaluate>;

    wind: ReturnType<typeof WindRules.evaluate>;

    runway: ReturnType<typeof RunwayRules.evaluate>;

    clouds: ReturnType<typeof CloudRules.evaluate>;

    icing: ReturnType<typeof IcingRules.evaluate>;

    turbulence: ReturnType<typeof TurbulenceRules.evaluate>;

    thunderstorms: ReturnType<typeof ThunderstormRules.evaluate>;

    precipitation: ReturnType<typeof PrecipitationRules.evaluate>;

    densityAltitude: ReturnType<typeof DensityAltitudeRules.evaluate>;

    volcanicAsh: ReturnType<typeof VolcanicAshRules.evaluate>;

    overallRiskScore: number;

    overallSeverity:
        | "NONE"
        | "LOW"
        | "MODERATE"
        | "HIGH"
        | "EXTREME";

    operationalStatus:
        | "NORMAL"
        | "CAUTION"
        | "RESTRICTED"
        | "CRITICAL";

    pilotRecommendations: PilotRecommendation;

    atcRecommendations: ATCRecommendation;

    dispatcherRecommendations: DispatcherRecommendation;

    airportRecommendations: AirportRecommendation;

}

export class WeatherDecisionEngine {

    static evaluate(
        wx: CanonicalWeatherObservation
    ): WeatherDecision {

        const visibility =
            VisibilityRules.evaluate(wx);

        const wind =
            WindRules.evaluate(wx);

        const runway =
            RunwayRules.evaluate(wx);

        const clouds =
            CloudRules.evaluate(wx);

        const icing =
            IcingRules.evaluate(wx);

        const turbulence =
            TurbulenceRules.evaluate(wx);

        const thunderstorms =
            ThunderstormRules.evaluate(wx);

        const precipitation =
            PrecipitationRules.evaluate(wx);

        const densityAltitude =
            DensityAltitudeRules.evaluate(wx);

        const volcanicAsh =
            VolcanicAshRules.evaluate(wx);
        
                const overallRiskScore =
            this.calculateOverallRisk([

                visibility.score,

                wind.score,

                runway.score,

                clouds.score,

                icing.score,

                turbulence.score,

                thunderstorms.score,

                precipitation.score,

                densityAltitude.score,

                volcanicAsh.score

            ]);

        const overallSeverity =
            this.determineSeverity(
                overallRiskScore
            );

        const operationalStatus =
            this.operationalStatus(
                overallRiskScore
            );

                const pilotRecommendations =
            PilotRecommendations.generate(wx);

        const atcRecommendations =
            ATCRecommendations.generate(wx);

        const dispatcherRecommendations =
            DispatcherRecommendations.generate(wx);

        const airportRecommendations =
            AirportRecommendations.generate(wx);

                return {

            observation: wx,

            visibility,

            wind,

            runway,

            clouds,

            icing,

            turbulence,

            thunderstorms,

            precipitation,

            densityAltitude,

            volcanicAsh,

            overallRiskScore,

            overallSeverity,

            operationalStatus,

            pilotRecommendations,

            atcRecommendations,

            dispatcherRecommendations,

            airportRecommendations

        };

    }

        static calculateOverallRisk(
        scores: number[]
    ): number {

        if (scores.length === 0)
            return 0;

        const average =
            scores.reduce(
                (a, b) => a + b,
                0
            ) / scores.length;

        const maximum =
            Math.max(...scores);

        return Math.round(
            average * 0.6 +
            maximum * 0.4
        );

    }

        static determineSeverity(
        score: number
    ):
        | "NONE"
        | "LOW"
        | "MODERATE"
        | "HIGH"
        | "EXTREME" {

        if (score <= 10)
            return "NONE";

        if (score <= 30)
            return "LOW";

        if (score <= 55)
            return "MODERATE";

        if (score <= 80)
            return "HIGH";

        return "EXTREME";

    }

        static operationalStatus(
        score: number
    ):
        | "NORMAL"
        | "CAUTION"
        | "RESTRICTED"
        | "CRITICAL" {

        if (score <= 10)
            return "NORMAL";

        if (score <= 30)
            return "CAUTION";

        if (score <= 60)
            return "RESTRICTED";

        return "CRITICAL";

    }

}