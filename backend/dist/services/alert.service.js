"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertService = void 0;
const prisma_1 = require("../utils/prisma");
const logger_1 = require("../utils/logger");
const client_1 = require("@prisma/client");
class AlertService {
    static async sendNotification(alert) {
        logger_1.logger.info(`Alert notification sent: ${alert.id} - ${alert.type}`);
        if (alert.severity === client_1.SeverityLevel.SEVERE || alert.severity === client_1.SeverityLevel.CRITICAL) {
            await this.sendEmailAlert(alert);
        }
        if (alert.severity === client_1.SeverityLevel.CRITICAL) {
            await this.sendSMSAlert(alert);
        }
    }
    static async sendEmailAlert(alert) {
        logger_1.logger.info(`Email alert sent for: ${alert.id}`);
    }
    static async sendSMSAlert(alert) {
        logger_1.logger.info(`SMS alert sent for: ${alert.id}`);
    }
    static async createWeatherAlerts(weatherData, thresholds) {
        try {
            const alerts = [];
            for (const threshold of thresholds) {
                let value = null;
                switch (threshold.parameter) {
                    case 'visibility':
                        value = weatherData.visibility;
                        break;
                    case 'wind_speed':
                        value = weatherData.windSpeed;
                        break;
                    case 'ceiling':
                        value = weatherData.cloudBase;
                        break;
                    case 'temperature':
                        value = weatherData.temperature;
                        break;
                    case 'crosswind':
                        value = weatherData.crosswindComponent;
                        break;
                    case 'density_altitude':
                        value = weatherData.densityAltitude;
                        break;
                }
                if (value !== null && value !== undefined) {
                    const isBreached = this.checkThresholdBreach(value, threshold.minValue, threshold.maxValue);
                    if (isBreached) {
                        const users = await prisma_1.prisma.user.findMany({
                            where: {
                                OR: [
                                    { role: threshold.userRole },
                                    { role: 'ADMIN' },
                                ],
                                isActive: true,
                            },
                        });
                        for (const user of users) {
                            alerts.push({
                                userId: user.id,
                                type: client_1.AlertType.WEATHER,
                                message: `${threshold.parameter} at ${value} ${this.getUnit(threshold.parameter)} - ${threshold.severityLevel}`,
                                severity: threshold.severityLevel,
                                actionUrl: `/thresholds/${threshold.id}`,
                            });
                        }
                    }
                }
            }
            if (alerts.length > 0) {
                await prisma_1.prisma.alert.createMany({
                    data: alerts,
                    skipDuplicates: true,
                });
                for (const alert of alerts) {
                    await this.sendNotification(alert);
                }
                logger_1.logger.info(`Created ${alerts.length} weather alerts`);
            }
        }
        catch (error) {
            logger_1.logger.error('Error creating weather alerts:', error);
        }
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
    static getUnit(parameter) {
        const units = {
            visibility: 'meters',
            wind_speed: 'knots',
            ceiling: 'feet',
            temperature: '°C',
            crosswind: 'knots',
            density_altitude: 'feet',
            rvr: 'meters',
        };
        return units[parameter] || '';
    }
    static async cleanupExpiredAlerts() {
        try {
            const result = await prisma_1.prisma.alert.deleteMany({
                where: {
                    expiresAt: {
                        lt: new Date(),
                    },
                },
            });
            if (result.count > 0) {
                logger_1.logger.info(`Cleaned up ${result.count} expired alerts`);
            }
        }
        catch (error) {
            logger_1.logger.error('Error cleaning up expired alerts:', error);
        }
    }
    static async getAlertStats(userId) {
        try {
            const total = await prisma_1.prisma.alert.count({
                where: { userId },
            });
            const unread = await prisma_1.prisma.alert.count({
                where: {
                    userId,
                    readStatus: false,
                },
            });
            const byType = await prisma_1.prisma.alert.groupBy({
                by: ['type'],
                where: { userId },
                _count: {
                    type: true,
                },
            });
            const bySeverity = await prisma_1.prisma.alert.groupBy({
                by: ['severity'],
                where: { userId },
                _count: {
                    severity: true,
                },
            });
            return {
                total,
                unread,
                byType: byType.map(t => ({
                    type: t.type,
                    count: t._count.type,
                })),
                bySeverity: bySeverity.map(s => ({
                    severity: s.severity,
                    count: s._count.severity,
                })),
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting alert stats:', error);
            throw error;
        }
    }
}
exports.AlertService = AlertService;
//# sourceMappingURL=alert.service.js.map