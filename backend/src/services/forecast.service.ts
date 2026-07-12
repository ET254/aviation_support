import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

export class ForecastService {
  /**
   * Generate forecast timeline
   */
  static generateTimeline(forecasts: any[], start: Date, end: Date): any[] {
    const timeline = [];
    const interval = 3600000; // 1 hour
    let current = new Date(start);

    while (current <= end) {
      const point = {
        timestamp: new Date(current),
        conditions: this.getConditionsAtTime(forecasts, current),
      };
      timeline.push(point);
      current = new Date(current.getTime() + interval);
    }

    return timeline;
  }

  /**
   * Get conditions at specific time
   */
  static getConditionsAtTime(forecasts: any[], time: Date): any {
    // Find active forecast
    const activeForecast = forecasts.find(f => 
      f.validFrom <= time && f.validTo >= time
    );

    if (!activeForecast) {
      return { status: 'No forecast available' };
    }

    // Parse TAF if available
    if (activeForecast.taf) {
      return this.parseTAF(activeForecast.taf, time);
    }

    // Parse SIGMET if available
    if (activeForecast.sigmetData) {
      return this.parseSIGMET(activeForecast.sigmetData);
    }

    return {
      status: 'Forecast available',
      freezingLevel: activeForecast.freezingLevel,
      turbulence: activeForecast.turbulenceForecast,
      icing: activeForecast.icingForecast,
    };
  }

  /**
   * Parse TAF (Terminal Aerodrome Forecast)
   */
  static parseTAF(taf: string, time: Date): any {
    // Simple TAF parser (would be more comprehensive in production)
    const parts = taf.split(' ');
    const result: any = {
      raw: taf,
      timestamp: time,
    };

    // Extract wind information
    const windIndex = parts.findIndex(p => /^\d{5}KT$/.test(p));
    if (windIndex !== -1) {
      const wind = parts[windIndex];
      result.windDirection = parseInt(wind.substring(0, 3), 10);
      result.windSpeed = parseInt(wind.substring(3, 5), 10);
    }

    // Extract visibility
    const visIndex = parts.findIndex(p => /^\d{4}$/.test(p) && parseInt(p, 10) > 1000);
    if (visIndex !== -1) {
      result.visibility = parseInt(parts[visIndex], 10);
    }

    // Extract cloud information
    const cloudCodes = ['FEW', 'SCT', 'BKN', 'OVC'];
    for (let i = 0; i < parts.length; i++) {
      if (cloudCodes.includes(parts[i]) && i + 1 < parts.length) {
        result.cloudType = parts[i];
        result.cloudBase = parseInt(parts[i + 1], 10) * 100;
        break;
      }
    }

    return result;
  }

  /**
   * Parse SIGMET data
   */
  static parseSIGMET(sigmetData: any): any {
    if (typeof sigmetData === 'string') {
      return {
        raw: sigmetData,
        type: this.detectSIGMETType(sigmetData),
        severity: this.detectSIGMETSeverity(sigmetData),
      };
    }
    return sigmetData;
  }

  /**
   * Detect SIGMET type
   */
  static detectSIGMETType(sigmet: string): string {
    const types = {
      'TS': 'Thunderstorm',
      'TURB': 'Turbulence',
      'ICE': 'Icing',
      'WS': 'Wind Shear',
      'VA': 'Volcanic Ash',
      'TC': 'Tropical Cyclone',
    };

    for (const [code, type] of Object.entries(types)) {
      if (sigmet.includes(code)) {
        return type;
      }
    }
    return 'Unknown';
  }

  /**
   * Detect SIGMET severity
   */
  static detectSIGMETSeverity(sigmet: string): string {
    if (sigmet.includes('SEV')) return 'SEVERE';
    if (sigmet.includes('MOD')) return 'MODERATE';
    if (sigmet.includes('LGT')) return 'LIGHT';
    return 'UNKNOWN';
  }

  /**
   * Process NetCDF data
   */
  static async processNetCDFData(filePath: string): Promise<any[]> {
    // This would use the netcdf4 library to parse NetCDF files
    // For now, returning sample structure
    const forecasts = [];
    
    // Sample forecast generation
    const now = new Date();
    for (let i = 0; i < 8; i++) {
      const validFrom = new Date(now.getTime() + i * 3 * 3600000);
      const validTo = new Date(validFrom.getTime() + 3 * 3600000);
      
      forecasts.push({
        validFrom,
        validTo,
        taf: this.generateSampleTAF(validFrom),
        sigmetData: this.generateSampleSIGMET(validFrom),
        upperWind: this.generateSampleUpperWind(validFrom),
        upperTemp: this.generateSampleUpperTemp(validFrom),
        freezingLevel: 10000 + Math.random() * 5000,
        turbulenceForecast: ['LIGHT', 'MODERATE', 'SEVERE'][Math.floor(Math.random() * 3)],
        icingForecast: ['NONE', 'LIGHT', 'MODERATE'][Math.floor(Math.random() * 3)],
      });
    }

    return forecasts;
  }

  /**
   * Generate sample TAF for testing
   */
  static generateSampleTAF(time: Date): string {
    const windDir = Math.floor(Math.random() * 360);
    const windSpeed = 5 + Math.floor(Math.random() * 20);
    const visibility = 5000 + Math.floor(Math.random() * 10000);
    const cloudCodes = ['FEW', 'SCT', 'BKN', 'OVC'];
    const cloudCode = cloudCodes[Math.floor(Math.random() * cloudCodes.length)];
    const cloudBase = 10 + Math.floor(Math.random() * 30);
    
    return `${windDir.toString().padStart(3, '0')}${windSpeed.toString().padStart(2, '0')}KT ${visibility} ${cloudCode}${cloudBase.toString().padStart(3, '0')}`;
  }

  /**
   * Generate sample SIGMET for testing
   */
  static generateSampleSIGMET(time: Date): any {
    const types = ['TS', 'TURB', 'ICE', 'WS'];
    const type = types[Math.floor(Math.random() * types.length)];
    const severity = ['LGT', 'MOD', 'SEV'][Math.floor(Math.random() * 3)];
    
    return {
      type,
      severity,
      description: `SIGMET for ${type} at ${time.toISOString()}`,
      validFrom: time,
      validTo: new Date(time.getTime() + 4 * 3600000),
    };
  }

  /**
   * Generate sample upper wind data
   */
  static generateSampleUpperWind(time: Date): any {
    const levels = [850, 700, 500, 300, 200];
    const windData: any = {};

    for (const level of levels) {
      windData[level] = {
        direction: Math.floor(Math.random() * 360),
        speed: 10 + Math.floor(Math.random() * 50),
      };
    }

    return windData;
  }

  /**
   * Generate sample upper temperature data
   */
  static generateSampleUpperTemp(time: Date): any {
    const levels = [850, 700, 500, 300, 200];
    const tempData: any = {};

    for (const level of levels) {
      const baseTemp = 15 - (level / 100) * 6.5;
      tempData[level] = baseTemp + (Math.random() * 10 - 5);
    }

    return tempData;
  }
}