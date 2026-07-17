"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionSupportController = void 0;
const prisma_1 = require("../utils/prisma");
const riskAssessment_service_1 = require("../services/riskAssessment.service");
const decisionSupport_service_1 = require("../services/decisionSupport/decisionSupport.service");
const weatherMapper_1 = require("../services/weather/weatherMapper");
class DecisionSupportController {
    static async evaluateStation(req, res) {
        try {
            const { stationId } = req.params;
            const latestWeather = await prisma_1.prisma.weatherData.findFirst({
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
                    message: "No weather observation found."
                });
            }
            const weather = latestWeather;
            const risk = riskAssessment_service_1.RiskAssessmentService.assess(weather);
            const decision = decisionSupport_service_1.DecisionSupportService.evaluateDecision(weather, risk);
            return res.json({
                success: true,
                data: decision
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Decision evaluation failed."
            });
        }
    }
    static async evaluateObservation(req, res) {
        try {
            const weather = req.body;
            const risk = riskAssessment_service_1.RiskAssessmentService.assess(weather);
            const decision = decisionSupport_service_1.DecisionSupportService.evaluateDecision(weather, risk);
            return res.json({
                success: true,
                data: decision
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Unable to evaluate observation."
            });
        }
    }
    static async dashboard(req, res) {
        try {
            const { stationId } = req.params;
            const latestWeather = await prisma_1.prisma.weatherData.findFirst({
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
                    message: "Weather not found."
                });
            }
            const weather = weatherMapper_1.WeatherMapper.map(latestWeather, latestWeather.station);
            const risk = riskAssessment_service_1.RiskAssessmentService.assess(weather);
            const decision = decisionSupport_service_1.DecisionSupportService.evaluateDecision(weather, risk);
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
                    weatherDecision: decision.weatherDecision
                }
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Dashboard generation failed."
            });
        }
    }
}
exports.DecisionSupportController = DecisionSupportController;
//# sourceMappingURL=decisionSupport.controller.js.map