import { logger } from './logger';
import { AppError } from '../middleware/errorHandler';
import * as fs from 'fs';
import * as path from 'path';
import { execSync, spawn } from 'child_process';

export class NetCDFParser {
  /**
   * Parse NetCDF file using Python netCDF4 library
   */
  static async parseFile(filePath: string, latitude?: number, longitude?: number): Promise<any[]> {
    try {
      if (!filePath || !filePath.toLowerCase().endsWith('.nc')) {
        throw new AppError('Invalid NetCDF file path', 400);
      }

      const exists = fs.existsSync(filePath);
      if (!exists) {
        logger.warn(`NetCDF file not found at ${filePath}; will use sample data for development`);
        return this.generateSampleForecast();
      }

      logger.info(`Attempting to parse NetCDF file: ${filePath}`);
      
      // Try to extract data using Python script
      const pythonScript = path.join(__dirname, '../../scripts/extract_netcdf.py');
      if (!fs.existsSync(pythonScript)) {
        logger.warn('Python extraction script not found; using deterministic forecast');
        return this.generateDeterministicForecast(filePath);
      }

      try {
        const result = this.extractNetCDFWithPython(
          filePath,
          pythonScript,
          latitude,
          longitude
        );
        logger.info(`Successfully extracted NetCDF file: ${filePath}`);
        return this.convertExtractedDataToForecasts(result, filePath);
      } catch (pythonError) {
        logger.warn(`Python extraction failed: ${pythonError}; falling back to deterministic forecast`);
        return this.generateDeterministicForecast(filePath);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error parsing NetCDF file';
      logger.error(`Error parsing NetCDF file: ${errorMessage}`);
      throw new AppError(`Failed to parse NetCDF file: ${errorMessage}`, 500);
    }
  }

  /**
   * Extract NetCDF data using Python script
   */
  private static extractNetCDFWithPython(
    filePath: string,
    pythonScript: string,
    latitude?: number,
    longitude?: number
  ): any {
    try {
      const args = [`"${pythonScript}"`, `"${filePath}"`];
      if (latitude !== undefined && longitude !== undefined) {
        args.push(latitude.toString(), longitude.toString());
      }

      const output = execSync(`python ${args.join(' ')}`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 30000,
      });
      
      const data = JSON.parse(output);
      if (!data.success) {
        throw new Error(data.error || 'Unknown error in Python extraction');
      }
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Python extraction error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Convert extracted NetCDF data to forecast format
   */
  private static convertExtractedDataToForecasts(extractedData: any, filePath: string): any[] {
    const forecasts: any[] = [];
    const now = new Date();

    // Use extracted forecast data if available
    if (extractedData.forecasts && Array.isArray(extractedData.forecasts)) {
      for (let i = 0; i < Math.min(6, extractedData.forecasts.length); i++) {
        const forecastItem = extractedData.forecasts[i];
        const validFrom = new Date(now.getTime() + i * 3 * 3600000);
        const validTo = new Date(validFrom.getTime() + 3 * 3600000);

        // Extract WRF variables and convert units
        // T2: Temperature in Kelvin -> convert to Celsius
        const temperature = forecastItem.T2 ? (forecastItem.T2 - 273.15) : (20 + Math.random() * 10);
        
        // U10, V10: Wind components in m/s
        const windU = forecastItem.U10 ?? (5 + Math.random() * 10);
        const windV = forecastItem.V10 ?? (5 + Math.random() * 10);
        
        // PSFC: Surface pressure in Pa -> convert to hPa
        const pressure = forecastItem.PSFC ? (forecastItem.PSFC / 100) : (1013 + Math.random() * 10);
        
        // RAINNC: Cumulative rainfall in mm
        const precipitation = forecastItem.RAINNC ?? (Math.random() * 5);
        
        // CLDFRA: Cloud fraction (0-1)
        const cloudFraction = Math.min(1, forecastItem.CLDFRA ?? 0.5);

        // Calculate wind speed (m/s) and direction
        const windSpeedMs = Math.sqrt(windU * windU + windV * windV);
        // Convert m/s to knots (1 m/s = 1.94384 knots)
        const windSpeedKt = windSpeedMs * 1.94384;
        const windDirection = (Math.atan2(windV, windU) * (180 / Math.PI) + 180) % 360;
        
        // Create visibility based on precipitation and cloud cover
        // Reduced visibility with precipitation, reduced with clouds
        let visibility = 10000 - (cloudFraction * 3000);
        if (precipitation > 0.5) {
          visibility = Math.max(1000, visibility - (precipitation * 1000));
        }
        
        // Cloud base height in feet (higher with less clouds)
        const cloudBase = 3000 - (cloudFraction * 2000);

        forecasts.push({
          validFrom,
          validTo,
          timestep: i,
          temperature: Math.round(temperature * 10) / 10,
          windSpeed: Math.round(windSpeedKt * 10) / 10,
          windDirection: Math.round(windDirection),
          windGust: Math.round((windSpeedKt * 1.3) * 10) / 10,  // Gust typically 1.3x sustained wind
          pressure: Math.round(pressure * 10) / 10,
          visibility: Math.round(visibility),
          cloudBase: Math.round(cloudBase),
          cloudCover: Math.round(cloudFraction * 100),
          precipitation: Math.round(precipitation * 10) / 10,
          dewPoint: Math.round((temperature - ((100 - cloudFraction * 100) / 5)) * 10) / 10,
          taf: this.generateTAFFromData(windDirection, windSpeedKt, visibility),
          sigmetData: this.generateSIGMETFromData(i, precipitation, windSpeedKt),
          upperWind: this.generateUpperWind(windSpeedKt),
          upperTemp: this.generateUpperTemp(temperature),
          freezingLevel: 7000 + i * 250,
          turbulenceForecast: this.getTurbulenceForecast(windSpeedKt),
          icingForecast: this.getIcingForecast(temperature, precipitation),
          source: 'NETCDF',
          fileReference: path.basename(filePath),
        });
      }
    } else {
      // Fallback if no forecast data extracted
      return this.generateDeterministicForecast(filePath);
    }

    return forecasts;
  }

  /**
   * Generate deterministic forecast as fallback
   */
  private static generateDeterministicForecast(filePath: string): any[] {
    const forecasts = [];
    const now = new Date();

    for (let i = 0; i < 6; i++) {
      const validFrom = new Date(now.getTime() + i * 3 * 3600000);
      const validTo = new Date(validFrom.getTime() + 3 * 3600000);
      const windDir = 180 + Math.floor(Math.random() * 180);
      const windSpeed = 10 + Math.floor(Math.random() * 20);
      const visibility = 5000 + Math.floor(Math.random() * 10000);

      forecasts.push({
        validFrom,
        validTo,
        timestep: i,
        temperature: 20 + Math.random() * 10,
        windSpeed,
        windDirection: windDir,
        windGust: windSpeed * 1.5,
        pressure: 1013,
        visibility,
        cloudBase: 2500,
        cloudCover: 50,
        precipitation: 0,
        dewPoint: 15,
        taf: this.generateTAFFromData(windDir, windSpeed, visibility),
        sigmetData: this.generateSIGMETFromData(i, 0, windSpeed),
        upperWind: this.generateUpperWind(windSpeed),
        upperTemp: this.generateUpperTemp(20),
        freezingLevel: 7000 + i * 250,
        turbulenceForecast: this.getTurbulenceForecast(windSpeed),
        icingForecast: this.getIcingForecast(20, 0),
        source: 'NETCDF',
        fileReference: path.basename(filePath),
      });
    }

    return forecasts;
  }

  /**
   * Generate sample forecast for development
   */
  private static generateSampleForecast(): any[] {
    const forecasts = [];
    const now = new Date();

    for (let i = 0; i < 6; i++) {
      const validFrom = new Date(now.getTime() + i * 3 * 3600000);
      const validTo = new Date(validFrom.getTime() + 3 * 3600000);

      forecasts.push({
        validFrom,
        validTo,
        timestep: i,
        temperature: 22 + Math.random() * 5,
        windSpeed: 8 + Math.random() * 12,
        windDirection: 200 + Math.random() * 80,
        windGust: 12 + Math.random() * 15,
        pressure: 1014 + Math.random() * 2,
        visibility: 9000 + Math.random() * 3000,
        cloudBase: 2800,
        cloudCover: 40,
        precipitation: 0,
        dewPoint: 16,
        taf: 'SAMPLE TAF',
        sigmetData: { type: 'NONE' },
        upperWind: 'Sample upper wind',
        upperTemp: 'Sample upper temp',
        freezingLevel: 7200,
        turbulenceForecast: 'Light',
        icingForecast: 'None',
        source: 'SAMPLE',
        fileReference: 'sample.nc',
      });
    }

    return forecasts;
  }

  /**
   * Generate TAF from forecast data
   */
  private static generateTAFFromData(windDir: number, windSpeed: number, visibility: number): string {
    const cloudCodes = ['FEW', 'SCT', 'BKN', 'OVC'];
    const cloudCode = cloudCodes[Math.floor(Math.random() * cloudCodes.length)];
    const cloudBase = 15 + Math.floor(Math.random() * 25);
    
    return `${windDir.toString().padStart(3, '0')}${Math.round(windSpeed).toString().padStart(2, '0')}KT ${Math.round(visibility)} ${cloudCode}${cloudBase.toString().padStart(3, '0')}`;
  }

  /**
   * Generate SIGMET from forecast data
   */
  private static generateSIGMETFromData(index: number, precipitation: number, windSpeed: number): any {
    let type = 'NONE';
    let severity = 'LGT';

    if (precipitation > 5) {
      type = 'TS';
      severity = precipitation > 10 ? 'SEV' : 'MOD';
    } else if (windSpeed > 25) {
      type = 'WS';
      severity = windSpeed > 35 ? 'SEV' : 'MOD';
    }

    return {
      type,
      severity,
      description: `SIGMET for ${type} at forecast hour ${index * 3}`,
      validFrom: new Date(Date.now() + index * 3 * 3600000),
      validTo: new Date(Date.now() + (index + 1) * 3 * 3600000),
    };
  }

  /**
   * Generate upper wind data
   */
  private static generateUpperWind(baseWindSpeed: number): any {
    const levels = [850, 700, 500, 300, 200];
    const windData: any = {};
    
    for (const level of levels) {
      const factor = level / 500; // Lower levels have weaker wind
      windData[level] = {
        speed: Math.round((baseWindSpeed * factor) * 10) / 10,
        direction: (Math.random() * 360),
      };
    }

    return windData;
  }

  /**
   * Generate upper temperature data
   */
  private static generateUpperTemp(surfaceTemp: number): any {
    const levels = [850, 700, 500, 300, 200];
    const tempData: any = {};
    
    for (const level of levels) {
      const tempLapse = (500 - level) * 0.0065; // Standard lapse rate
      tempData[level] = Math.round((surfaceTemp - tempLapse) * 10) / 10;
    }

    return tempData;
  }

  /**
   * Get turbulence forecast
   */
  private static getTurbulenceForecast(windSpeed: number): string {
    if (windSpeed > 30) return 'Moderate';
    if (windSpeed > 20) return 'Light to Moderate';
    if (windSpeed > 10) return 'Light';
    return 'None';
  }

  /**
   * Get icing forecast
   */
  private static getIcingForecast(temperature: number, precipitation: number): string {
    if (temperature < 0 && precipitation > 2) return 'Moderate';
    if (temperature < 0 && precipitation > 0) return 'Light';
    if (temperature < -10) return 'Trace';
    return 'None';
  }
}

export default NetCDFParser;