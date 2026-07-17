import { DecisionSupportService, AviationDecision, OperationalStatus, DecisionColour } from '../src/services/decisionSupport/decisionSupport.service';
import { RiskAssessmentService } from '../src/services/riskAssessment.service';

describe('DecisionSupportService', () => {
  it('returns a guarded operational decision for adverse weather', () => {
    const weather: any = {
      stationId: 'station-1',
      stationCode: 'HKJK',
      stationName: 'Nairobi',
      source: 'NETCDF',
      timestamp: new Date(),
      temperature: 32,
      dewPoint: 18,
      qnh: 1010,
      windDirection: 240,
      windSpeed: 35,
      windGust: 45,
      visibility: 1800,
      cloudBase: 400,
      precipitationType: 'RAIN',
      precipitationIntensity: 25,
      densityAltitude: 9500,
      crosswindComponent: 24,
      headwindComponent: 5,
      tailwindComponent: 12,
      cloudType: 'BROKEN',
    };

    const risk = RiskAssessmentService.assess(weather);
    const result = DecisionSupportService.evaluateDecision(weather, risk);

    expect(result.decision).toBeDefined();
    expect(result.status).toBeDefined();
    expect(result.colour).toBeDefined();
    expect(result.overallRiskScore).toBeGreaterThan(0);
    expect(result.summary).toContain('operational');
    expect(result.recommendations.pilots.length).toBeGreaterThan(0);
  });

  it('returns a normal decision when conditions are benign', () => {
    const weather: any = {
      stationId: 'station-1',
      stationCode: 'HKJK',
      stationName: 'Nairobi',
      source: 'METAR',
      timestamp: new Date(),
      temperature: 22,
      dewPoint: 14,
      qnh: 1015,
      windDirection: 120,
      windSpeed: 8,
      windGust: 10,
      visibility: 12000,
      cloudBase: 3000,
      precipitationType: 'NONE',
      precipitationIntensity: 0,
      densityAltitude: 5000,
      crosswindComponent: 4,
      headwindComponent: 8,
      tailwindComponent: 0,
      cloudType: 'FEW',
    };

    const risk = RiskAssessmentService.assess(weather);
    const result = DecisionSupportService.evaluateDecision(weather, risk);

    expect(result.decision).toBe(AviationDecision.GO);
    expect(result.status).toBe(OperationalStatus.NORMAL);
    expect(result.colour).toBe(DecisionColour.GREEN);
  });
});
