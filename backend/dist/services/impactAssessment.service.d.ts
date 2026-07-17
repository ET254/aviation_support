import { RiskAssessment } from "./riskAssessment.service";
export interface OperationalImpact {
    pilots: string[];
    atc: string[];
    dispatch: string[];
    airportOperations: string[];
    meteorologists: string[];
    maintenance: string[];
    summary: string[];
}
export declare class ImpactAssessmentService {
    static assess(weather: any, risk: RiskAssessment): OperationalImpact;
}
//# sourceMappingURL=impactAssessment.service.d.ts.map