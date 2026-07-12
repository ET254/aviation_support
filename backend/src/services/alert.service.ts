import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { AlertType, SeverityLevel } from '@prisma/client';

export class AlertService {
  /**
   * Send real-time notification
   */
  static async sendNotification(alert: any): Promise<void> {
    // In production, this would integrate with WebSocket, email, SMS, etc.
    logger.info(`Alert notification sent: ${alert.id} - ${alert.type}`);
    
    // Could send email notification
    if (alert.severity === SeverityLevel.SEVERE || alert.severity === SeverityLevel.CRITICAL) {
      await this.sendEmailAlert(alert);
    }

    // Could send SMS for critical alerts
    if (alert.severity === SeverityLevel.CRITICAL) {
      await this.sendSMSAlert(alert);
    }
  }

  /**
   * Send email alert
   */
  static async sendEmailAlert(alert: any): Promise<void> {
    // This would use nodemailer or similar in production
    logger.info(`Email alert sent for: ${alert.id}`);
  }

  /**
   * Send SMS alert
   */
  static async sendSMSAlert(alert: any): Promise<void> {
    // This would use Twilio or similar in production
    logger.info(`SMS alert sent for: ${alert.id}`);
  }

  /**
   * Create alerts for all impacted users
   */
  static async createWeatherAlerts(weatherData: any, thresholds: any[]): Promise<void> {
    try {
      const alerts = [];

      for (const threshold of thresholds) {
        let value: number | null = null;

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
          const isBreached = this.checkThresholdBreach(
            value,
            threshold.minValue,
            threshold.maxValue
          );

          if (isBreached) {
            // Get users who should receive this alert
            const users = await prisma.user.findMany({
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
                type: AlertType.WEATHER,
                message: `${threshold.parameter} at ${value} ${this.getUnit(threshold.parameter)} - ${threshold.severityLevel}`,
                severity: threshold.severityLevel,
                actionUrl: `/thresholds/${threshold.id}`,
              });
            }
          }
        }
      }

      // Create alerts in batches
      if (alerts.length > 0) {
        await prisma.alert.createMany({
          data: alerts,
          skipDuplicates: true,
        });

        // Send notifications
        for (const alert of alerts) {
          await this.sendNotification(alert);
        }

        logger.info(`Created ${alerts.length} weather alerts`);
      }
    } catch (error) {
      logger.error('Error creating weather alerts:', error);
    }
  }

  /**
   * Check threshold breach
   */
  static checkThresholdBreach(
    value: number,
    minValue: number | null,
    maxValue: number | null
  ): boolean {
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

  /**
   * Get unit for parameter
   */
  static getUnit(parameter: string): string {
    const units: Record<string, string> = {
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

  /**
   * Clean up expired alerts
   */
  static async cleanupExpiredAlerts(): Promise<void> {
    try {
      const result = await prisma.alert.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      if (result.count > 0) {
        logger.info(`Cleaned up ${result.count} expired alerts`);
      }
    } catch (error) {
      logger.error('Error cleaning up expired alerts:', error);
    }
  }

  /**
   * Get alert statistics
   */
  static async getAlertStats(userId: string): Promise<any> {
    try {
      const total = await prisma.alert.count({
        where: { userId },
      });

      const unread = await prisma.alert.count({
        where: {
          userId,
          readStatus: false,
        },
      });

      const byType = await prisma.alert.groupBy({
        by: ['type'],
        where: { userId },
        _count: {
          type: true,
        },
      });

      const bySeverity = await prisma.alert.groupBy({
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
    } catch (error) {
      logger.error('Error getting alert stats:', error);
      throw error;
    }
  }
}