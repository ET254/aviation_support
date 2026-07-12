import { Request, Response } from "express";

import { prisma } from "../utils/prisma";

import { RiskAssessmentService } from "../services/riskAssessment.service";

import { DecisionSupportService } from "../services/decisionSupport/decisionSupport.service";

import { CanonicalWeatherObservation } from "../models/weather/CanonicalWeatherObservation";

import { WeatherMapper } from "../services/weather/weatherMapper";

export class DecisionSupportController {

    /**
     * ===========================================================
     * Evaluate latest weather for one station
     * ===========================================================
     */

    static async evaluateStation(
        req: Request,
        res: Response
    ) {

        try {

            const { stationId } = req.params;

            const latestWeather =
                await prisma.weatherData.findFirst({

                    where: {
                        stationId
                    },
                    include: {
                        station: true
                    },
                    orderBy: {
                        timestamp: "desc"
                    }

                });

            if (!latestWeather) {

                return res.status(404).json({

                    success: false,

                    message:
                        "No weather observation found."

                });

            }

            const weather =
                latestWeather as unknown as CanonicalWeatherObservation;

            const risk =
                RiskAssessmentService.assess(weather);

            const decision =
                DecisionSupportService.evaluateDecision(
                    weather,
                    risk
                );

            return res.json({

                success: true,

                data: decision

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message:
                    "Decision evaluation failed."

            });

        }

    }

    /**
     * ===========================================================
     * Evaluate supplied observation
     * ===========================================================
     */

    static async evaluateObservation(
        req: Request,
        res: Response
    ) {

        try {

            const weather =
                req.body as CanonicalWeatherObservation;

            const risk =
                RiskAssessmentService.assess(weather);

            const decision =
                DecisionSupportService.evaluateDecision(
                    weather,
                    risk
                );

            return res.json({

                success: true,

                data: decision

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message:
                    "Unable to evaluate observation."

            });

        }

    }

    /**
     * ===========================================================
     * Dashboard Summary
     * ===========================================================
     */

    static async dashboard(
        req: Request,
        res: Response
    ) {

        try {

            const { stationId } = req.params;

            const latestWeather =
                await prisma.weatherData.findFirst({

                    where: {
                        stationId
                    },
                    include: {
                        station: true
                    },
                    orderBy: {
                        timestamp: "desc"
                    }

                });

            if (!latestWeather) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Weather not found."

                });

            }

            const weather = WeatherMapper.map(
                latestWeather,
                latestWeather.station
            );
            const risk =
                RiskAssessmentService.assess(weather);

            const decision =
                DecisionSupportService.evaluateDecision(
                    weather,
                    risk
                );

            return res.json({

                success: true,

                stationId,

                generatedAt: new Date(),

                dashboard: {

                    decision: decision.decision,

                    colour: decision.colour,

                    status: decision.status,

                    confidence: decision.confidence,

                    overallRisk: decision.overallRiskScore,

                    summary: decision.summary,

                    impacts: decision.impacts,

                    recommendations: decision.recommendations,

                    risk: decision.risk,

                    evaluatedAt: decision.evaluatedAt,

                    weatherDecision:
                        decision.weatherDecision

                }

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message:
                    "Dashboard generation failed."

            });

        }

    }

}