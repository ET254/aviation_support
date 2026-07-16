import { SeverityLevel } from '@prisma/client';
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
export declare class ImpactService {
    static assessImpact(weather: any, thresholds: any[], role?: string): ImpactAssessment;
    static groupThresholdsByRole(thresholds: any[]): Map<string, any[]>;
    static calculateRoleImpact(weather: any, thresholds: any[]): any;
    static determineHighestSeverity(weather: any, thresholds: any[]): SeverityLevel;
    static getImpactDetails(weather: any, thresholds: any[]): any;
    static checkThresholdBreach(value: number, minValue: number | null, maxValue: number | null): boolean;
    static getSeverityLevel(severity: SeverityLevel): number;
    static generateRecommendations(weather: any, impact: any, role: string): any[];
    static getPriority(severity: SeverityLevel): 'critical' | 'high' | 'medium' | 'low';
    static getPilotAction(weather: any, impact: any): string;
    static getDispatcherAction(weather: any, impact: any): string;
    static getATCAction(weather: any, impact: any): string;
    static getOperationsAction(weather: any, impact: any): string;
    static getGroundHandlerAction(weather: any, impact: any): string;
    static getMeteorologistAction(weather: any, impact: any): string;
    static prioritizeRecommendations(recommendations: any[]): any[];
    static generateSummary(weather: any, severity: SeverityLevel): string;
    static getSeverityColor(severity: SeverityLevel): string;
    static getImpactsByRole(stationId: string, role: string): Promise<any>;
    static getDecisionLadder(stationId: string, role?: string): Promise<any[]>;
    static getActionRecommendations(stationId: string, role?: string): Promise<any[]>;
}
export default ImpactService;
//# sourceMappingURL=impact.service.d.ts.map