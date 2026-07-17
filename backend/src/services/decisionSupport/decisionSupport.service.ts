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
        const visibility = Number(weather.visibility ?? 99999);
        if (visibility < 800) {
            return { score: 95, reason: 'Visibility below CAT II minima.' };
        }
        if (visibility < 3000) {
            return { score: 70, reason: 'Visibility reduced below normal operating minima.' };
        }
        if (visibility < 5000) {
            return { score: 35, reason: 'Visibility is reduced but still manageable.' };
        }
        return { score: 5, reason: 'Visibility is good for normal operations.' };
    }

    private static evaluateWind(weather: any): DecisionScore {
        const windSpeed = Number(weather.windSpeed ?? 0);
        if (windSpeed >= 40) {
            return { score: 90, reason: 'Surface winds are severe.' };
        }
        if (windSpeed >= 25) {
            return { score: 65, reason: 'Surface winds are strong.' };
        }
        if (windSpeed >= 15) {
            return { score: 30, reason: 'Surface winds require monitoring.' };
        }
        return { score: 5, reason: 'Surface winds are within expected limits.' };
    }

    private static evaluateCrosswind(weather: any): DecisionScore {
        const crosswind = Math.abs(Number(weather.crosswindComponent ?? 0));
        if (crosswind >= 30) {
            return { score: 90, reason: 'Crosswind exceeds runway operational limits.' };
        }
        if (crosswind >= 20) {
            return { score: 65, reason: 'Crosswind is high for some aircraft types.' };
        }
        if (crosswind >= 10) {
            return { score: 25, reason: 'Crosswind requires attention.' };
        }
        return { score: 5, reason: 'Crosswind is acceptable.' };
    }

    private static evaluateCloud(weather: any): DecisionScore {
        const cloudBase = Number(weather.cloudBase ?? 99999);
        if (cloudBase < 300) {
            return { score: 92, reason: 'Cloud ceiling is critically low.' };
        }
        if (cloudBase < 800) {
            return { score: 70, reason: 'Low cloud base threatens instrument minima.' };
        }
        if (cloudBase < 1500) {
            return { score: 35, reason: 'Cloud base is reduced.' };
        }
        return { score: 8, reason: 'Cloud base is comfortable for normal operations.' };
    }

    private static evaluateDensityAltitude(weather: any): DecisionScore {
        const densityAltitude = Number(weather.densityAltitude ?? 0);
        if (densityAltitude >= 9000) {
            return { score: 88, reason: 'Density altitude is very high and reduces performance.' };
        }
        if (densityAltitude >= 7000) {
            return { score: 55, reason: 'Density altitude is elevated.' };
        }
        if (densityAltitude >= 5000) {
            return { score: 25, reason: 'Density altitude is moderate.' };
        }
        return { score: 5, reason: 'Density altitude is within normal limits.' };
    }

    private static evaluateRiskAssessment(
        risk: RiskAssessment
    ): DecisionScore {
        const severityScore = {
            LOW: 15,
            MEDIUM: 35,
            HIGH: 60,
            EXTREME: 85,
        }[risk.overallRisk] ?? 20;

        return { score: severityScore, reason: risk.recommendation };
    }

    private static calculateConfidence(
        weather: any,
        risk: RiskAssessment
    ): number {
        const baseConfidence = 0.75;
        const visibilityConfidence = weather.visibility ? 0.1 : 0;
        const windConfidence = weather.windSpeed ? 0.08 : 0;
        const riskConfidence = risk.overallRisk ? 0.07 : 0;
        return Math.min(0.99, baseConfidence + visibilityConfidence + windConfidence + riskConfidence);
    }

    private static generateRecommendations(
        impacts: OperationalImpact
    ): UserRecommendations {
        return {
            pilots: impacts.pilots.slice(0, 3),
            atc: impacts.atc.slice(0, 3),
            dispatch: impacts.dispatch.slice(0, 3),
            meteorologists: impacts.meteorologists.slice(0, 3),
            airportOperations: impacts.airportOperations.slice(0, 3),
            maintenance: impacts.maintenance.slice(0, 3),
        };
    }

    private static generateSummary(
        decision: AviationDecision,
        score: number,
        reasons: DecisionScore[]
    ): string {
        const keyReason = reasons.sort((a, b) => b.score - a.score)[0]?.reason ?? 'Conditions are being monitored.';
        return `operational decision ${decision} with an overall risk score of ${score}. ${keyReason}`;
    }

}
