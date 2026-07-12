import { CanonicalWeatherObservation } from "../../models/weather/CanonicalWeatherObservation";

import {
    WeatherDecision,
    WeatherDecisionEngine
} from "./weatherDecisionEngine";

export class WeatherDecisionService {

    /**
     * ============================================================
     * Evaluate a single weather observation
     * ============================================================
     */
    static evaluateObservation(
        observation: CanonicalWeatherObservation
    ): WeatherDecision {

        return WeatherDecisionEngine.evaluate(
            observation
        );

    }

    /**
     * ============================================================
     * Evaluate multiple observations
     * ============================================================
     */
    static evaluateBatch(
        observations: CanonicalWeatherObservation[]
    ): WeatherDecision[] {

        return observations.map(observation =>
            WeatherDecisionEngine.evaluate(
                observation
            )
        );

    }

    /**
     * ============================================================
     * Highest Risk Observation
     * ============================================================
     */
    static highestRisk(
        observations: CanonicalWeatherObservation[]
    ): WeatherDecision | null {

        if (observations.length === 0)
            return null;

        const decisions =
            this.evaluateBatch(observations);

        return decisions.reduce(
            (highest, current) =>
                current.overallRiskScore >
                highest.overallRiskScore
                    ? current
                    : highest
        );

    }

    /**
     * ============================================================
     * Airport Operational Status
     * ============================================================
     */
    static airportStatus(
        observation: CanonicalWeatherObservation
    ) {

        const decision =
            this.evaluateObservation(
                observation
            );

        return {

            station:
                observation.stationId,

            operationalStatus:
                decision.operationalStatus,

            severity:
                decision.overallSeverity,

            riskScore:
                decision.overallRiskScore

        };

    }

    /**
     * ============================================================
     * Pilot Briefing
     * ============================================================
     */
    static pilotBriefing(
        observation: CanonicalWeatherObservation
    ) {

        return this.evaluateObservation(
            observation
        ).pilotRecommendations;

    }

    /**
     * ============================================================
     * ATC Briefing
     * ============================================================
     */
    static atcBriefing(
        observation: CanonicalWeatherObservation
    ) {

        return this.evaluateObservation(
            observation
        ).atcRecommendations;

    }

    /**
     * ============================================================
     * Dispatcher Briefing
     * ============================================================
     */
    static dispatcherBriefing(
        observation: CanonicalWeatherObservation
    ) {

        return this.evaluateObservation(
            observation
        ).dispatcherRecommendations;

    }

    /**
     * ============================================================
     * Airport Operations Briefing
     * ============================================================
     */
    static airportBriefing(
        observation: CanonicalWeatherObservation
    ) {

        return this.evaluateObservation(
            observation
        ).airportRecommendations;

    }

}