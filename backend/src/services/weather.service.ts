import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';
import { WeatherData, Threshold } from '../types';
import { prisma } from '../utils/prisma';

export class WeatherService {
  /**
   * Calculate derived meteorological parameters
   */
  static calculateDerivedParameters(data: any) {
    const derived: any = {};

    // Calculate density altitude
    if (data.temperature !== undefined && data.pressureQnh !== undefined && data.station?.elevation) {
      derived.densityAltitude = this.calculateDensityAltitude(
        data.temperature,
        data.pressureQnh,
        data.station.elevation
      );
    }

    // Calculate crosswind component
    if (data.windDirection !== undefined && data.windSpeed !== undefined) {
      // Assuming runway orientation from station or default
      const runwayOrientation = data.station?.runwayOrientation || '00';
      const runwayHeading = this.parseRunwayHeading(runwayOrientation);
      
      derived.crosswindComponent = this.calculateCrosswindComponent(
        data.windDirection,
        data.windSpeed,
        runwayHeading
      );
      
      derived.headwindComponent = this.calculateHeadwindComponent(
        data.windDirection,
        data.windSpeed,
        runwayHeading
      );
      
      derived.tailwindComponent = this.calculateTailwindComponent(
        data.windDirection,
        data.windSpeed,
        runwayHeading
      );
    }

    // Calculate heat index
    if (data.temperature !== undefined && data.humidity !== undefined) {
      derived.heatIndex = this.calculateHeatIndex(data.temperature, data.humidity);
    }

    // Calculate wind chill
    if (data.temperature !== undefined && data.windSpeed !== undefined && data.temperature <= 10) {
      derived.windChill = this.calculateWindChill(data.temperature, data.windSpeed);
    }

    return derived;
  }

  /**
   * Calculate density altitude
   * Formula based on ICAO standard atmosphere
   */
  static calculateDensityAltitude(tempC: number, pressureQnh: number, elevation: number): number {
    const tempK = tempC + 273.15;
    const pressureRatio = pressureQnh / 1013.25;
    const tempRatio = tempK / 288.15;
    const densityRatio = pressureRatio / tempRatio;
    
    // Simplified density altitude calculation
    const densityAltitude = elevation + (tempC - 15) * 120;
    return Math.round(densityAltitude);
  }

  /**
   * Parse runway heading from orientation string (e.g., "06/24" -> 60)
   */
  static parseRunwayHeading(orientation: string): number {
    if (!orientation) return 0;
    const parts = orientation.split('/');
    if (parts.length === 0) return 0;
    const heading = parseInt(parts[0], 10);
    return isNaN(heading) ? 0 : heading * 10;
  }

  /**
   * Calculate crosswind component
   * Wind speed * sin(wind angle relative to runway)
   */
  static calculateCrosswindComponent(
    windDirection: number,
    windSpeed: number,
    runwayHeading: number
  ): number {
    const angleDiff = windDirection - runwayHeading;
    const rad = (angleDiff * Math.PI) / 180;
    const crosswind = windSpeed * Math.sin(rad);
    return Math.round(crosswind * 10) / 10;
  }

  /**
   * Calculate headwind component
   * Wind speed * cos(wind angle relative to runway)
   */
  static calculateHeadwindComponent(
    windDirection: number,
    windSpeed: number,
    runwayHeading: number
  ): number {
    const angleDiff = windDirection - runwayHeading;
    const rad = (angleDiff * Math.PI) / 180;
    const headwind = windSpeed * Math.cos(rad);
    return headwind > 0 ? Math.round(headwind * 10) / 10 : 0;
  }

  /**
   * Calculate tailwind component
   * Negative headwind component
   */
  static calculateTailwindComponent(
    windDirection: number,
    windSpeed: number,
    runwayHeading: number
  ): number {
    const angleDiff = windDirection - runwayHeading;
    const rad = (angleDiff * Math.PI) / 180;
    const headwind = windSpeed * Math.cos(rad);
    return headwind < 0 ? Math.round(Math.abs(headwind) * 10) / 10 : 0;
  }

  /**
   * Calculate heat index
   * Simplified formula for aviation use
   */
  static calculateHeatIndex(tempC: number, humidity: number): number {
    if (tempC < 27) return tempC;
    
    const tempF = (tempC * 9/5) + 32;
    const hiF = -42.379 + 2.04901523 * tempF + 10.14333127 * humidity 
      - 0.22475541 * tempF * humidity - 0.00683783 * tempF * tempF 
      - 0.05481717 * humidity * humidity + 0.00122874 * tempF * tempF * humidity 
      + 0.00085282 * tempF * humidity * humidity - 0.00000199 * tempF * tempF * humidity * humidity;
    
    return Math.round(((hiF - 32) * 5/9) * 10) / 10;
  }

  /**
   * Calculate wind chill
   */
  static calculateWindChill(tempC: number, windSpeed: number): number {
    if (tempC > 10 || windSpeed < 5) return tempC;
    
    const windChill = 13.12 + 0.6215 * tempC - 11.37 * Math.pow(windSpeed, 0.16) 
      + 0.3965 * tempC * Math.pow(windSpeed, 0.16);
    
    return Math.round(windChill * 10) / 10;
  }

  /**
   * Check thresholds for weather data
   */
  static async checkThresholds(weatherData: any): Promise<void> {
    try {
      const thresholds = await prisma.threshold.findMany({
        where: {
          stationId: weatherData.stationId,
          isActive: true,
        },
      });

      const alerts: any[] = [];

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
          case 'wind_gust':
            value = weatherData.gustSpeed;
            break;
          case 'rvr':
            value = weatherData.rvr;
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
            alerts.push({
              userId: weatherData.userId,
              type: 'WEATHER',
              message: `${threshold.parameter} threshold breached: ${value} (${threshold.severityLevel})`,
              severity: threshold.severityLevel,
              actionUrl: `/thresholds/${threshold.id}`,
            });
          }
        }
      }

      // Create alerts for breaches
      for (const alert of alerts) {
        await prisma.alert.create({
          data: alert,
        });
      }

      if (alerts.length > 0) {
        logger.info(`Created ${alerts.length} alerts for weather data ${weatherData.id}`);
      }
    } catch (error) {
      logger.error('Error checking thresholds:', error);
    }
  }

  /**
   * Check if value breaches threshold
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
   * Parse CSV record to weather data
   */
  static parseCSVRecord(record: any): any {
    return {
      timestamp: new Date(record.timestamp || record.datetime),
      temperature: parseFloat(record.temperature) || undefined,
      windDirection: parseFloat(record.wind_direction) || undefined,
      windSpeed: parseFloat(record.wind_speed) || undefined,
      gustSpeed: parseFloat(record.gust_speed) || undefined,
      visibility: parseFloat(record.visibility) || undefined,
      rvr: parseFloat(record.rvr) || undefined,
      pressureQnh: parseFloat(record.pressure_qnh) || undefined,
      pressureQfe: parseFloat(record.pressure_qfe) || undefined,
      humidity: parseFloat(record.humidity) || undefined,
      dewPoint: parseFloat(record.dew_point) || undefined,
      cloudAmount: parseFloat(record.cloud_amount) || undefined,
      cloudBase: parseFloat(record.cloud_base) || undefined,
      cloudType: record.cloud_type || undefined,
      precipitationType: record.precipitation_type || undefined,
      precipitationIntensity: parseFloat(record.precipitation_intensity) || undefined,
    };
  }

  /**
   * Parse Excel record to weather data
   */
  static parseExcelRecord(record: any): any {
    return this.parseCSVRecord(record);
  }

  /**
   * Analyze weather trends
   */
  static analyzeTrends(weatherData: any[]): any {
    if (weatherData.length === 0) {
      return {
        temperature: { trend: 'stable', min: 0, max: 0, avg: 0 },
        wind: { trend: 'stable', avg: 0, max: 0 },
        pressure: { trend: 'stable', avg: 0, min: 0, max: 0 },
      };
    }

    const sorted = weatherData.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const temps = sorted.map(d => d.temperature).filter(t => t !== null && t !== undefined);
    const winds = sorted.map(d => d.windSpeed).filter(w => w !== null && w !== undefined);
    const pressures = sorted.map(d => d.pressureQnh).filter(p => p !== null && p !== undefined);

    return {
      temperature: {
        trend: this.calculateTrend(temps, 'temperature'),
        min: Math.min(...temps),
        max: Math.max(...temps),
        avg: this.calculateAverage(temps),
        current: temps[temps.length - 1],
      },
      wind: {
        trend: this.calculateTrend(winds, 'windSpeed'),
        avg: this.calculateAverage(winds),
        max: Math.max(...winds),
        current: winds[winds.length - 1],
      },
      pressure: {
        trend: this.calculateTrend(pressures, 'pressureQnh'),
        avg: this.calculateAverage(pressures),
        min: Math.min(...pressures),
        max: Math.max(...pressures),
        current: pressures[pressures.length - 1],
      },
    };
  }

  /**
   * Calculate trend
   */
  static calculateTrend(values: number[], field: string): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 3) return 'stable';

    const first = values[0];
    const last = values[values.length - 1];
    const diff = last - first;
    const threshold = Math.abs(first) * 0.05;

    if (Math.abs(diff) < threshold) return 'stable';
    return diff > 0 ? 'increasing' : 'decreasing';
  }

  /**
   * Calculate average
   */
  static calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round((sum / values.length) * 10) / 10;
  }

  /**
   * Calculate weather statistics
   */
  static calculateStatistics(weatherData: any[]): any {
    if (weatherData.length === 0) {
      return {
        count: 0,
        averages: {},
        extremes: {},
      };
    }

    const stats: any = {
      count: weatherData.length,
      averages: {},
      extremes: {
        temperature: { min: Infinity, max: -Infinity },
        windSpeed: { min: Infinity, max: -Infinity },
        visibility: { min: Infinity, max: -Infinity },
        pressureQnh: { min: Infinity, max: -Infinity },
      },
    };

    const fields = ['temperature', 'windSpeed', 'visibility', 'pressureQnh', 'humidity'];

    for (const field of fields) {
      const values = weatherData
        .map(d => d[field])
        .filter(v => v !== null && v !== undefined);

      if (values.length > 0) {
        stats.averages[field] = this.calculateAverage(values);
        
        if (stats.extremes[field]) {
          stats.extremes[field].min = Math.min(...values);
          stats.extremes[field].max = Math.max(...values);
        }
      }
    }

    return stats;
  }
}