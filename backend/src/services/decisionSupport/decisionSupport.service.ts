import { CanonicalWeatherObservation } from "../../models/weather/CanonicalWeatherObservation";
import { RiskAssessment } from "../riskAssessment.service";
import {
    ImpactAssessmentService,
    OperationalImpact,
} from "../impactAssessment.service";
import {
    WeatherDecisionEngine,
    WeatherDecision
} from "./weatherDecisionEngine";
/* ===========================================================
   OPERATIONAL ENUMS
=========================================================== */

export enum AviationDecision {

    GO = "GO",

    GO_WITH_CAUTION = "GO_WITH_CAUTION",

    DELAY = "DELAY",

    HOLD = "HOLD",

    DIVERT = "DIVERT",

    CANCEL = "CANCEL"

}

export enum OperationalStatus {

    NORMAL = "NORMAL",

    MONITOR = "MONITOR",

    CAUTION = "CAUTION",

    RESTRICTED = "RESTRICTED",

    SUSPENDED = "SUSPENDED",

    CLOSED = "CLOSED"

}

export enum DecisionColour {

    GREEN = "GREEN",

    YELLOW = "YELLOW",

    ORANGE = "ORANGE",

    RED = "RED"

}

/* ===========================================================
   USER RECOMMENDATIONS
=========================================================== */

export interface UserRecommendations {

    pilots: string[];

    atc: string[];

    dispatch: string[];

    meteorologists: string[];

    airportOperations: string[];

    maintenance: string[];

}

/* ===========================================================
   DECISION RESULT
=========================================================== */

export interface DecisionSupportResult {

    decision: AviationDecision;

    status: OperationalStatus;

    colour: DecisionColour;

    confidence: number;

    overallRiskScore: number;

    summary: string;

    recommendations: UserRecommendations;

    impacts: OperationalImpact;

    risk: RiskAssessment;

    weatherDecision: WeatherDecision;

    evaluatedAt: Date;

}

/* ===========================================================
   INTERNAL SCORING
=========================================================== */

interface DecisionScore {

    score: number;

    reason: string;

}

/* ===========================================================
   DECISION SUPPORT ENGINE
=========================================================== */

export class DecisionSupportService {

    /* ================================================
       MASTER ENGINE
    ================================================ */

    static evaluateDecision(

        weather: CanonicalWeatherObservation,

        risk: RiskAssessment

    ): DecisionSupportResult {

        //------------------------------------------------
        // Step 1
        //------------------------------------------------

        const impacts =
            ImpactAssessmentService.assess(weather, risk);

        const weatherDecision =
            WeatherDecisionEngine.evaluate(weather);

        //------------------------------------------------
        // Step 2
        //------------------------------------------------

        const scores: DecisionScore[] = [];

        //------------------------------------------------
        // Step 3
        //------------------------------------------------

        scores.push(
            this.evaluateVisibility(weather)
        );

        scores.push(
            this.evaluateWind(weather)
        );

        scores.push(
            this.evaluateCrosswind(weather)
        );

        scores.push(
            this.evaluateCloud(weather)
        );

        scores.push(
            this.evaluateDensityAltitude(weather)
        );

        //------------------------------------------------
        // Step 4
        //------------------------------------------------

        scores.push(
            this.evaluateRiskAssessment(risk)
        );

        //------------------------------------------------
        // Step 5
        //------------------------------------------------

        const overallRiskScore =
            this.calculateOverallRisk(scores);

        //------------------------------------------------
        // Step 6
        //------------------------------------------------

        const decision =
            this.determineDecision(overallRiskScore);

        //------------------------------------------------
        // Step 7
        //------------------------------------------------

        const status =
            this.determineOperationalStatus(
                overallRiskScore
            );

        //------------------------------------------------
        // Step 8
        //------------------------------------------------

        const colour =
            this.determineColour(
                overallRiskScore
            );

        //------------------------------------------------
        // Step 9
        //------------------------------------------------

        const confidence =
            this.calculateConfidence(
                weather,
                risk
            );

        //------------------------------------------------
        // Step 10
        //------------------------------------------------

        const recommendations =
            this.generateRecommendations(
                impacts
            );

        //------------------------------------------------
        // Step 11
        //------------------------------------------------

        const summary =
            this.generateSummary(
                decision,
                overallRiskScore,
                scores
            );

        //------------------------------------------------
        // Final Result
        //------------------------------------------------

        return {

            decision,

            status,

            colour,

            confidence,

            overallRiskScore,

            summary,

            recommendations,

            impacts,

            risk,

            weatherDecision,

            evaluatedAt: new Date()

        };

    }

    /* ================================================
       RISK AGGREGATION
    ================================================ */

    private static calculateOverallRisk(

        scores: DecisionScore[]

    ): number {

        if (scores.length === 0)
            return 0;

        const total =
            scores.reduce(
                (sum, s) => sum + s.score,
                0
            );

        return Math.round(total / scores.length);

    }

    /* ================================================
       DECISION
    ================================================ */

    private static determineDecision(

        score: number

    ): AviationDecision {

        if (score < 20)
            return AviationDecision.GO;

        if (score < 40)
            return AviationDecision.GO_WITH_CAUTION;

        if (score < 60)
            return AviationDecision.DELAY;

        if (score < 80)
            return AviationDecision.HOLD;

        if (score < 90)
            return AviationDecision.DIVERT;

        return AviationDecision.CANCEL;

    }

    /* ================================================
       STATUS
    ================================================ */

    private static determineOperationalStatus(

        score: number

    ): OperationalStatus {

        if (score < 20)
            return OperationalStatus.NORMAL;

        if (score < 40)
            return OperationalStatus.MONITOR;

        if (score < 60)
            return OperationalStatus.CAUTION;

        if (score < 80)
            return OperationalStatus.RESTRICTED;

        if (score < 95)
            return OperationalStatus.SUSPENDED;

        return OperationalStatus.CLOSED;

    }

    /* ================================================
       COLOUR
    ================================================ */

    private static determineColour(

        score: number

    ): DecisionColour {

        if (score < 25)
            return DecisionColour.GREEN;

        if (score < 50)
            return DecisionColour.YELLOW;

        if (score < 75)
            return DecisionColour.ORANGE;

        return DecisionColour.RED;

    }

    /* ================================================
       PLACEHOLDERS
       (Implemented fully in Part 2 onwards)
    ================================================ */

    private static evaluateVisibility(weather: any): DecisionScore {
        throw new Error("Implemented in Part 2");
    }

    private static evaluateWind(weather: any): DecisionScore {
        throw new Error("Implemented in Part 2");
    }

    private static evaluateCrosswind(weather: any): DecisionScore {
        throw new Error("Implemented in Part 2");
    }

    private static evaluateCloud(weather: any): DecisionScore {
        throw new Error("Implemented in Part 2");
    }

    private static evaluateDensityAltitude(weather: any): DecisionScore {
        throw new Error("Implemented in Part 3");
    }

    private static evaluateRiskAssessment(
        risk: RiskAssessment
    ): DecisionScore {
        throw new Error("Implemented in Part 3");
    }

    private static calculateConfidence(
        weather: any,
        risk: RiskAssessment
    ): number {
        throw new Error("Implemented in Part 4");
    }

    private static generateRecommendations(
        impacts: OperationalImpact
    ): UserRecommendations {
        throw new Error("Implemented in Part 4");
    }

    private static generateSummary(
        decision: AviationDecision,
        score: number,
        reasons: DecisionScore[]
    ): string {
        throw new Error("Implemented in Part 4");
    }

}
