"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImpactService = void 0;
const prisma_1 = require("../utils/prisma");
const client_1 = require("@prisma/client");
class ImpactService {
    static assessImpact(weather, thresholds, role) {
        const roleImpacts = {};
        const recommendations = [];
        let highestSeverity = client_1.SeverityLevel.NORMAL;
        const thresholdsByRole = this.groupThresholdsByRole(thresholds);
        for (const [userRole, roleThresholds] of Object.entries(thresholdsByRole)) {
            const impact = this.calculateRoleImpact(weather, roleThresholds);
            roleImpacts[userRole] = impact;
            if (this.getSeverityLevel(impact.severity) > this.getSeverityLevel(highestSeverity)) {
                highestSeverity = impact.severity;
            }
            const roleRecommendations = this.generateRecommendations(weather, impact, userRole);
            recommendations.push(...roleRecommendations);
        }
        const filteredImpacts = role ? { [role]: roleImpacts[role] } : roleImpacts;
        return {
            overallSeverity: highestSeverity,
            summary: this.generateSummary(weather, highestSeverity),
            roleImpacts: filteredImpacts,
            recommendations: this.prioritizeRecommendations(recommendations),
            severityColor: this.getSeverityColor(highestSeverity),
        };
    }
    static groupThresholdsByRole(thresholds) {
        const grouped = new Map();
        for (const threshold of thresholds) {
            const role = threshold.userRole || 'default';
            if (!grouped.has(role)) {
                grouped.set(role, []);
            }
            grouped.get(role).push(threshold);
        }
        return grouped;
    }
    static calculateRoleImpact(weather, thresholds) {
        const severity = this.determineHighestSeverity(weather, thresholds);
        const details = this.getImpactDetails(weather, thresholds);
        return {
            severity,
            details,
            timestamp: weather.timestamp,
        };
    }
    static determineHighestSeverity(weather, thresholds) {
        let highest = client_1.SeverityLevel.NORMAL;
        for (const threshold of thresholds) {
            let value = null;
            switch (threshold.parameter) {
                case 'visibility':
                    value = weather.visibility;
                    break;
                case 'wind_speed':
                    value = weather.windSpeed;
                    break;
                case 'ceiling':
                    value = weather.cloudBase;
                    break;
                case 'temperature':
                    value = weather.temperature;
                    break;
                case 'crosswind':
                    value = weather.crosswindComponent;
                    break;
                case 'density_altitude':
                    value = weather.densityAltitude;
                    break;
            }
            if (value !== null && value !== undefined) {
                const isBreached = this.checkThresholdBreach(value, threshold.minValue, threshold.maxValue);
                if (isBreached) {
                    const severityLevel = this.getSeverityLevel(threshold.severityLevel);
                    if (severityLevel > this.getSeverityLevel(highest)) {
                        highest = threshold.severityLevel;
                    }
                }
            }
        }
        return highest;
    }
    static getImpactDetails(weather, thresholds) {
        const details = {};
        for (const threshold of thresholds) {
            let value = null;
            switch (threshold.parameter) {
                case 'visibility':
                    value = weather.visibility;
                    break;
                case 'wind_speed':
                    value = weather.windSpeed;
                    break;
                case 'ceiling':
                    value = weather.cloudBase;
                    break;
                case 'temperature':
                    value = weather.temperature;
                    break;
                case 'crosswind':
                    value = weather.crosswindComponent;
                    break;
                case 'density_altitude':
                    value = weather.densityAltitude;
                    break;
            }
            if (value !== null && value !== undefined) {
                const isBreached = this.checkThresholdBreach(value, threshold.minValue, threshold.maxValue);
                details[threshold.parameter] = {
                    value,
                    threshold: {
                        min: threshold.minValue,
                        max: threshold.maxValue,
                    },
                    breached: isBreached,
                    severity: threshold.severityLevel,
                    action: threshold.actionRequired,
                };
            }
        }
        return details;
    }
    static checkThresholdBreach(value, minValue, maxValue) {
        if (minValue !== null && maxValue !== null) {
            return value < minValue || value > maxValue;
        }
        if (minValue !== null) {
            return value < minValue;
        }
        if (maxValue !== null) {
            return value > maxValue;
        }
        return false;
    }
    static getSeverityLevel(severity) {
        const levels = {
            NORMAL: 0,
            MONITOR: 1,
            CAUTION: 2,
            RESTRICTED: 3,
            SEVERE: 4,
            CRITICAL: 5,
        };
        return levels[severity] || 0;
    }
    static generateRecommendations(weather, impact, role) {
        const recommendations = [];
        if (impact.severity === client_1.SeverityLevel.NORMAL) {
            recommendations.push({
                priority: 'low',
                action: 'Continue normal operations',
                role,
            });
            return recommendations;
        }
        switch (role) {
            case 'PILOT':
                recommendations.push({
                    priority: this.getPriority(impact.severity),
                    action: this.getPilotAction(weather, impact),
                    role,
                });
                break;
            case 'DISPATCHER':
                recommendations.push({
                    priority: this.getPriority(impact.severity),
                    action: this.getDispatcherAction(weather, impact),
                    role,
                });
                break;
            case 'ATC':
                recommendations.push({
                    priority: this.getPriority(impact.severity),
                    action: this.getATCAction(weather, impact),
                    role,
                });
                break;
            case 'OPERATIONS':
                recommendations.push({
                    priority: this.getPriority(impact.severity),
                    action: this.getOperationsAction(weather, impact),
                    role,
                });
                break;
            case 'GROUND_HANDLER':
                recommendations.push({
                    priority: this.getPriority(impact.severity),
                    action: this.getGroundHandlerAction(weather, impact),
                    role,
                });
                break;
            case 'METEOROLOGIST':
                recommendations.push({
                    priority: this.getPriority(impact.severity),
                    action: this.getMeteorologistAction(weather, impact),
                    role,
                });
                break;
            default:
                recommendations.push({
                    priority: this.getPriority(impact.severity),
                    action: impact.details.actionRequired || 'Monitor conditions closely',
                    role,
                });
        }
        return recommendations;
    }
    static getPriority(severity) {
        switch (severity) {
            case client_1.SeverityLevel.CRITICAL:
                return 'critical';
            case client_1.SeverityLevel.SEVERE:
            case client_1.SeverityLevel.RESTRICTED:
                return 'high';
            case client_1.SeverityLevel.CAUTION:
                return 'medium';
            default:
                return 'low';
        }
    }
    static getPilotAction(weather, impact) {
        const actions = [];
        if (impact.details.visibility?.breached) {
            actions.push('Prepare for instrument approach if visibility is reduced');
        }
        if (impact.details.crosswind?.breached) {
            actions.push(`Crosswind ${weather.crosswindComponent}kt - check aircraft limitations`);
        }
        if (impact.details.ceiling?.breached) {
            actions.push('Be prepared for missed approach if ceiling is low');
        }
        if (impact.details.temperature?.breached) {
            actions.push('Calculate takeoff and landing performance for density altitude');
        }
        if (impact.severity === client_1.SeverityLevel.SEVERE || impact.severity === client_1.SeverityLevel.CRITICAL) {
            actions.push('Consider diverting to alternate airport');
        }
        return actions.length > 0 ? actions.join('. ') : 'Continue with standard procedures';
    }
    static getDispatcherAction(weather, impact) {
        const actions = [];
        if (impact.details.wind_speed?.breached) {
            actions.push('Adjust fuel planning for possible holding patterns');
        }
        if (impact.details.visibility?.breached) {
            actions.push('Prepare alternate route planning');
        }
        if (impact.details.temperature?.breached) {
            actions.push('Review performance limitations for affected aircraft types');
        }
        return actions.length > 0 ? actions.join('. ') : 'Standard dispatch procedures';
    }
    static getATCAction(weather, impact) {
        const actions = [];
        if (impact.details.visibility?.breached) {
            actions.push('Increase separation minima');
        }
        if (impact.details.crosswind?.breached) {
            actions.push('Assign alternate runway if available');
        }
        if (impact.details.ceiling?.breached) {
            actions.push('Prepare for ILS approaches');
        }
        return actions.length > 0 ? actions.join('. ') : 'Normal ATC operations';
    }
    static getOperationsAction(weather, impact) {
        const actions = [];
        if (impact.details.visibility?.breached) {
            actions.push('Deploy additional ground personnel for low visibility procedures');
        }
        if (impact.details.wind_speed?.breached) {
            actions.push('Secure ground equipment');
        }
        if (impact.details.temperature?.breached) {
            actions.push('Monitor runway surface temperature');
        }
        return actions.length > 0 ? actions.join('. ') : 'Standard operations procedures';
    }
    static getGroundHandlerAction(weather, impact) {
        const actions = [];
        if (impact.details.visibility?.breached) {
            actions.push('Implement low visibility ground movement procedures');
        }
        if (impact.details.wind_speed?.breached) {
            actions.push('Secure ground support equipment');
        }
        if (impact.details.precipitation_type) {
            actions.push(`Prepare for ${weather.precipitationType} conditions`);
        }
        return actions.length > 0 ? actions.join('. ') : 'Standard ground operations';
    }
    static getMeteorologistAction(weather, impact) {
        const actions = [];
        if (impact.details.temperature?.breached) {
            actions.push('Issue updated temperature forecast');
        }
        if (impact.details.visibility?.breached) {
            actions.push('Update TAF with current visibility trends');
        }
        if (impact.details.wind_speed?.breached) {
            actions.push('Issue wind shear advisory if applicable');
        }
        return actions.length > 0 ? actions.join('. ') : 'Continue monitoring and updating forecasts';
    }
    static prioritizeRecommendations(recommendations) {
        const priorityOrder = {
            critical: 0,
            high: 1,
            medium: 2,
            low: 3
        };
        return recommendations.sort((a, b) => {
            const aPriority = priorityOrder[a.priority] !== undefined ? priorityOrder[a.priority] : 999;
            const bPriority = priorityOrder[b.priority] !== undefined ? priorityOrder[b.priority] : 999;
            return aPriority - bPriority;
        });
    }
    static generateSummary(weather, severity) {
        const summaries = {
            NORMAL: 'Conditions are normal. All operations can continue as planned.',
            MONITOR: 'Monitor conditions for potential changes. No immediate action required.',
            CAUTION: 'Caution advised. Some operational limitations may apply.',
            RESTRICTED: 'Restricted operations in effect. Only essential operations should continue.',
            SEVERE: 'Severe conditions. Consider operational suspension.',
            CRITICAL: 'Critical conditions. Immediate action required.',
        };
        let summary = summaries[severity] || 'Unknown conditions';
        const conditions = [];
        if (weather.visibility && weather.visibility < 3000)
            conditions.push('reduced visibility');
        if (weather.windSpeed && weather.windSpeed > 25)
            conditions.push('strong winds');
        if (weather.temperature && weather.temperature > 35)
            conditions.push('high temperature');
        if (weather.cloudBase && weather.cloudBase < 1000)
            conditions.push('low ceiling');
        if (conditions.length > 0) {
            summary += ` Conditions include: ${conditions.join(', ')}.`;
        }
        return summary;
    }
    static getSeverityColor(severity) {
        const colors = {
            NORMAL: '#22c55e',
            MONITOR: '#eab308',
            CAUTION: '#f97316',
            RESTRICTED: '#ef4444',
            SEVERE: '#dc2626',
            CRITICAL: '#7f1d1d',
        };
        return colors[severity] || '#94a3b8';
    }
    static async getImpactsByRole(stationId, role) {
        const weather = await prisma_1.prisma.weatherData.findFirst({
            where: { stationId },
            orderBy: { timestamp: 'desc' },
        });
        if (!weather) {
            return { message: 'No weather data available' };
        }
        const thresholds = await prisma_1.prisma.threshold.findMany({
            where: {
                stationId,
                OR: [
                    { userRole: role },
                    { userRole: null },
                ],
                isActive: true,
            },
        });
        return this.calculateRoleImpact(weather, thresholds);
    }
    static async getDecisionLadder(stationId, role) {
        const weather = await prisma_1.prisma.weatherData.findFirst({
            where: { stationId },
            orderBy: { timestamp: 'desc' },
        });
        if (!weather) {
            return [];
        }
        const thresholds = await prisma_1.prisma.threshold.findMany({
            where: {
                stationId,
                isActive: true,
                ...(role && { userRole: role }),
            },
            orderBy: {
                severityLevel: 'desc',
            },
        });
        const ladder = [];
        let currentStep = 0;
        for (const threshold of thresholds) {
            let value = null;
            switch (threshold.parameter) {
                case 'visibility':
                    value = weather.visibility;
                    break;
                case 'wind_speed':
                    value = weather.windSpeed;
                    break;
                case 'ceiling':
                    value = weather.cloudBase;
                    break;
                case 'temperature':
                    value = weather.temperature;
                    break;
                case 'crosswind':
                    value = weather.crosswindComponent;
                    break;
                case 'density_altitude':
                    value = weather.densityAltitude;
                    break;
            }
            if (value !== null && value !== undefined) {
                const isBreached = this.checkThresholdBreach(value, threshold.minValue, threshold.maxValue);
                if (isBreached) {
                    currentStep++;
                    ladder.push({
                        step: currentStep,
                        parameter: threshold.parameter,
                        value,
                        threshold: {
                            min: threshold.minValue,
                            max: threshold.maxValue,
                        },
                        severity: threshold.severityLevel,
                        action: threshold.actionRequired,
                        color: this.getSeverityColor(threshold.severityLevel),
                    });
                }
            }
        }
        return ladder;
    }
    static async getActionRecommendations(stationId, role) {
        const weather = await prisma_1.prisma.weatherData.findFirst({
            where: { stationId },
            orderBy: { timestamp: 'desc' },
        });
        if (!weather) {
            return [];
        }
        const thresholds = await prisma_1.prisma.threshold.findMany({
            where: {
                stationId,
                isActive: true,
                ...(role && { userRole: role }),
            },
        });
        const recommendations = [];
        for (const threshold of thresholds) {
            let value = null;
            switch (threshold.parameter) {
                case 'visibility':
                    value = weather.visibility;
                    break;
                case 'wind_speed':
                    value = weather.windSpeed;
                    break;
                case 'ceiling':
                    value = weather.cloudBase;
                    break;
                case 'temperature':
                    value = weather.temperature;
                    break;
                case 'crosswind':
                    value = weather.crosswindComponent;
                    break;
                case 'density_altitude':
                    value = weather.densityAltitude;
                    break;
            }
            if (value !== null && value !== undefined) {
                const isBreached = this.checkThresholdBreach(value, threshold.minValue, threshold.maxValue);
                if (isBreached) {
                    recommendations.push({
                        parameter: threshold.parameter,
                        value,
                        severity: threshold.severityLevel,
                        action: threshold.actionRequired,
                        priority: this.getPriority(threshold.severityLevel),
                        role: threshold.userRole || 'ALL',
                    });
                }
            }
        }
        return this.prioritizeRecommendations(recommendations);
    }
}
exports.ImpactService = ImpactService;
exports.default = ImpactService;
//# sourceMappingURL=impact.service.js.map