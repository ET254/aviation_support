import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { SeverityLevel, UserRole } from '@prisma/client';

interface ImpactAssessment {
  overallSeverity: SeverityLevel;
  summary: string;
  roleImpacts: Record<string, any>;
  recommendations: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    action: string;
    role: string;
  }>;
  severityColor: string;
}

export class ImpactService {
  /**
   * Assess impact based on weather data and thresholds
   */
  static assessImpact(weather: any, thresholds: any[], role?: string): ImpactAssessment {
    const roleImpacts: Record<string, any> = {};
    const recommendations: any[] = [];
    let highestSeverity: SeverityLevel = SeverityLevel.NORMAL;

    // Group thresholds by role
    const thresholdsByRole = this.groupThresholdsByRole(thresholds);

    // Process impacts for each role
    for (const [userRole, roleThresholds] of Object.entries(thresholdsByRole)) {
      const impact = this.calculateRoleImpact(weather, roleThresholds);
      roleImpacts[userRole] = impact;

      // Track highest severity
      if (this.getSeverityLevel(impact.severity) > this.getSeverityLevel(highestSeverity)) {
        highestSeverity = impact.severity;
      }

      // Generate recommendations for this role
      const roleRecommendations = this.generateRecommendations(weather, impact, userRole);
      recommendations.push(...roleRecommendations);
    }

    // Filter by role if specified
    const filteredImpacts = role ? { [role]: roleImpacts[role] } : roleImpacts;

    return {
      overallSeverity: highestSeverity,
      summary: this.generateSummary(weather, highestSeverity),
      roleImpacts: filteredImpacts,
      recommendations: this.prioritizeRecommendations(recommendations),
      severityColor: this.getSeverityColor(highestSeverity),
    };
  }

  /**
   * Group thresholds by role
   */
  static groupThresholdsByRole(thresholds: any[]): Map<string, any[]> {
    const grouped = new Map<string, any[]>();
    
    for (const threshold of thresholds) {
      const role = threshold.userRole || 'default';
      if (!grouped.has(role)) {
        grouped.set(role, []);
      }
      grouped.get(role)!.push(threshold);
    }

    return grouped;
  }

  /**
   * Calculate impact for a specific role
   */
  static calculateRoleImpact(weather: any, thresholds: any[]): any {
    const severity = this.determineHighestSeverity(weather, thresholds);
    const details = this.getImpactDetails(weather, thresholds);

    return {
      severity,
      details,
      timestamp: weather.timestamp,
    };
  }

  /**
   * Determine highest severity level from thresholds
   */
  static determineHighestSeverity(weather: any, thresholds: any[]): SeverityLevel {
    let highest = SeverityLevel.NORMAL;

    for (const threshold of thresholds) {
      let value: number | null = null;

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
        const isBreached = this.checkThresholdBreach(
          value,
          threshold.minValue,
          threshold.maxValue
        );

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

  /**
   * Get impact details for a role
   */
  static getImpactDetails(weather: any, thresholds: any[]): any {
    const details: any = {};

    for (const threshold of thresholds) {
      let value: number | null = null;

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
        const isBreached = this.checkThresholdBreach(
          value,
          threshold.minValue,
          threshold.maxValue
        );

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
   * Get severity level value
   */
  static getSeverityLevel(severity: SeverityLevel): number {
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

  /**
   * Generate recommendations for a role
   */
  static generateRecommendations(weather: any, impact: any, role: string): any[] {
    const recommendations: any[] = [];

    if (impact.severity === SeverityLevel.NORMAL) {
      recommendations.push({
        priority: 'low',
        action: 'Continue normal operations',
        role,
      });
      return recommendations;
    }

    // Role-specific recommendations
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

  /**
   * Get priority based on severity
   */
  static getPriority(severity: SeverityLevel): 'critical' | 'high' | 'medium' | 'low' {
    switch (severity) {
      case SeverityLevel.CRITICAL:
        return 'critical';
      case SeverityLevel.SEVERE:
      case SeverityLevel.RESTRICTED:
        return 'high';
      case SeverityLevel.CAUTION:
        return 'medium';
      default:
        return 'low';
    }
  }

  /**
   * Get pilot-specific actions
   */
  static getPilotAction(weather: any, impact: any): string {
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
    
    if (impact.severity === SeverityLevel.SEVERE || impact.severity === SeverityLevel.CRITICAL) {
      actions.push('Consider diverting to alternate airport');
    }
    
    return actions.length > 0 ? actions.join('. ') : 'Continue with standard procedures';
  }

  /**
   * Get dispatcher-specific actions
   */
  static getDispatcherAction(weather: any, impact: any): string {
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

  /**
   * Get ATC-specific actions
   */
  static getATCAction(weather: any, impact: any): string {
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

  /**
   * Get operations-specific actions
   */
  static getOperationsAction(weather: any, impact: any): string {
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

  /**
   * Get ground handler-specific actions
   */
  static getGroundHandlerAction(weather: any, impact: any): string {
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

  /**
   * Get meteorologist-specific actions
   */
  static getMeteorologistAction(weather: any, impact: any): string {
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

  /**
   * Prioritize recommendations - FIXED VERSION
   */
  static prioritizeRecommendations(recommendations: any[]): any[] {
    // FIX: Use proper typing for priority order
    const priorityOrder: { [key: string]: number } = { 
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

  /**
   * Generate summary
   */
  static generateSummary(weather: any, severity: SeverityLevel): string {
    const summaries = {
      NORMAL: 'Conditions are normal. All operations can continue as planned.',
      MONITOR: 'Monitor conditions for potential changes. No immediate action required.',
      CAUTION: 'Caution advised. Some operational limitations may apply.',
      RESTRICTED: 'Restricted operations in effect. Only essential operations should continue.',
      SEVERE: 'Severe conditions. Consider operational suspension.',
      CRITICAL: 'Critical conditions. Immediate action required.',
    };
    
    let summary = summaries[severity] || 'Unknown conditions';
    
    // Add specific condition details
    const conditions = [];
    if (weather.visibility && weather.visibility < 3000) conditions.push('reduced visibility');
    if (weather.windSpeed && weather.windSpeed > 25) conditions.push('strong winds');
    if (weather.temperature && weather.temperature > 35) conditions.push('high temperature');
    if (weather.cloudBase && weather.cloudBase < 1000) conditions.push('low ceiling');
    
    if (conditions.length > 0) {
      summary += ` Conditions include: ${conditions.join(', ')}.`;
    }
    
    return summary;
  }

  /**
   * Get severity color
   */
  static getSeverityColor(severity: SeverityLevel): string {
    const colors = {
      NORMAL: '#22c55e', // green
      MONITOR: '#eab308', // yellow
      CAUTION: '#f97316', // orange
      RESTRICTED: '#ef4444', // red
      SEVERE: '#dc2626', // dark red
      CRITICAL: '#7f1d1d', // black-red
    };
    return colors[severity] || '#94a3b8';
  }

  /**
   * Get impacts by role
   */
  static async getImpactsByRole(stationId: string, role: string): Promise<any> {
    const weather = await prisma.weatherData.findFirst({
      where: { stationId },
      orderBy: { timestamp: 'desc' },
    });

    if (!weather) {
      return { message: 'No weather data available' };
    }

    const thresholds = await prisma.threshold.findMany({
      where: {
        stationId,
        OR: [
          { userRole: role as any },
          { userRole: null },
        ],
        isActive: true,
      },
    });

    return this.calculateRoleImpact(weather, thresholds);
  }

  /**
   * Get decision support ladder
   */
  static async getDecisionLadder(stationId: string, role?: string): Promise<any[]> {
    const weather = await prisma.weatherData.findFirst({
      where: { stationId },
      orderBy: { timestamp: 'desc' },
    });

    if (!weather) {
      return [];
    }

    const thresholds = await prisma.threshold.findMany({
      where: {
        stationId,
        isActive: true,
        ...(role && { userRole: role as any }),
      },
      orderBy: {
        severityLevel: 'desc',
      },
    });

    const ladder = [];
    let currentStep = 0;

    for (const threshold of thresholds) {
      let value: number | null = null;

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
        const isBreached = this.checkThresholdBreach(
          value,
          threshold.minValue,
          threshold.maxValue
        );

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

  /**
   * Get action recommendations
   */
  static async getActionRecommendations(stationId: string, role?: string): Promise<any[]> {
    const weather = await prisma.weatherData.findFirst({
      where: { stationId },
      orderBy: { timestamp: 'desc' },
    });

    if (!weather) {
      return [];
    }

    const thresholds = await prisma.threshold.findMany({
      where: {
        stationId,
        isActive: true,
        ...(role && { userRole: role as any }),
      },
    });

    const recommendations: any[] = [];

    for (const threshold of thresholds) {
      let value: number | null = null;

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
        const isBreached = this.checkThresholdBreach(
          value,
          threshold.minValue,
          threshold.maxValue
        );

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

export default ImpactService;