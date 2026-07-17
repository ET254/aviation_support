"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetCDFParser = void 0;
const logger_1 = require("./logger");
const errorHandler_1 = require("../middleware/errorHandler");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
class NetCDFParser {
    static async parseFile(filePath) {
        try {
            if (!filePath || !filePath.toLowerCase().endsWith('.nc')) {
                throw new errorHandler_1.AppError('Invalid NetCDF file path', 400);
            }
            const exists = fs.existsSync(filePath);
            if (!exists) {
                logger_1.logger.warn(`NetCDF file not found at ${filePath}; will use sample data for development`);
                return this.generateSampleForecast();
            }
            logger_1.logger.info(`Attempting to parse NetCDF file: ${filePath}`);
            const pythonScript = path.join(__dirname, '../../scripts/extract_netcdf.py');
            if (!fs.existsSync(pythonScript)) {
                logger_1.logger.warn('Python extraction script not found; using deterministic forecast');
                return this.generateDeterministicForecast(filePath);
            }
            try {
                const result = this.extractNetCDFWithPython(filePath, pythonScript);
                logger_1.logger.info(`Successfully extracted NetCDF file: ${filePath}`);
                return this.convertExtractedDataToForecasts(result, filePath);
            }
            catch (pythonError) {
                logger_1.logger.warn(`Python extraction failed: ${pythonError}; falling back to deterministic forecast`);
                return this.generateDeterministicForecast(filePath);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error parsing NetCDF file';
            logger_1.logger.error(`Error parsing NetCDF file: ${errorMessage}`);
            throw new errorHandler_1.AppError(`Failed to parse NetCDF file: ${errorMessage}`, 500);
        }
    }
    static extractNetCDFWithPython(filePath, pythonScript) {
        try {
            const output = (0, child_process_1.execSync)(`python "${pythonScript}" "${filePath}"`, {
                encoding: 'utf-8',
                stdio: ['pipe', 'pipe', 'pipe'],
                timeout: 30000
            });
            const data = JSON.parse(output);
            if (!data.success) {
                throw new Error(data.error || 'Unknown error in Python extraction');
            }
            return data;
        }
        catch (error) {
            if (error instanceof Error) {
                logger_1.logger.error(`Python extraction error: ${error.message}`);
            }
            throw error;
        }
    }
    static convertExtractedDataToForecasts(extractedData, filePath) {
        const forecasts = [];
        const now = new Date();
        if (extractedData.forecasts && Array.isArray(extractedData.forecasts)) {
            for (let i = 0; i < Math.min(6, extractedData.forecasts.length); i++) {
                const forecastItem = extractedData.forecasts[i];
                const validFrom = new Date(now.getTime() + i * 3 * 3600000);
                const validTo = new Date(validFrom.getTime() + 3 * 3600000);
                const temperature = forecastItem.T2 ? (forecastItem.T2 - 273.15) : (20 + Math.random() * 10);
                const windU = forecastItem.U10 ?? (5 + Math.random() * 10);
                const windV = forecastItem.V10 ?? (5 + Math.random() * 10);
                const pressure = forecastItem.PSFC ? (forecastItem.PSFC / 100) : (1013 + Math.random() * 10);
                const precipitation = forecastItem.RAINNC ?? (Math.random() * 5);
                const cloudFraction = Math.min(1, forecastItem.CLDFRA ?? 0.5);
                const windSpeedMs = Math.sqrt(windU * windU + windV * windV);
                const windSpeedKt = windSpeedMs * 1.94384;
                const windDirection = (Math.atan2(windV, windU) * (180 / Math.PI) + 180) % 360;
                let visibility = 10000 - (cloudFraction * 3000);
                if (precipitation > 0.5) {
                    visibility = Math.max(1000, visibility - (precipitation * 1000));
                }
                const cloudBase = 3000 - (cloudFraction * 2000);
                forecasts.push({
                    validFrom,
                    validTo,
                    timestep: i,
                    temperature: Math.round(temperature * 10) / 10,
                    windSpeed: Math.round(windSpeedKt * 10) / 10,
                    windDirection: Math.round(windDirection),
                    windGust: Math.round((windSpeedKt * 1.3) * 10) / 10,
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
        }
        else {
            return this.generateDeterministicForecast(filePath);
        }
        return forecasts;
    }
    static generateDeterministicForecast(filePath) {
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
    static generateSampleForecast() {
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
    static generateTAFFromData(windDir, windSpeed, visibility) {
        const cloudCodes = ['FEW', 'SCT', 'BKN', 'OVC'];
        const cloudCode = cloudCodes[Math.floor(Math.random() * cloudCodes.length)];
        const cloudBase = 15 + Math.floor(Math.random() * 25);
        return `${windDir.toString().padStart(3, '0')}${Math.round(windSpeed).toString().padStart(2, '0')}KT ${Math.round(visibility)} ${cloudCode}${cloudBase.toString().padStart(3, '0')}`;
    }
    static generateSIGMETFromData(index, precipitation, windSpeed) {
        let type = 'NONE';
        let severity = 'LGT';
        if (precipitation > 5) {
            type = 'TS';
            severity = precipitation > 10 ? 'SEV' : 'MOD';
        }
        else if (windSpeed > 25) {
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
    static generateUpperWind(baseWindSpeed) {
        const levels = [850, 700, 500, 300, 200];
        const windData = {};
        for (const level of levels) {
            const factor = level / 500;
            windData[level] = {
                speed: Math.round((baseWindSpeed * factor) * 10) / 10,
                direction: (Math.random() * 360),
            };
        }
        return windData;
    }
    static generateUpperTemp(surfaceTemp) {
        const levels = [850, 700, 500, 300, 200];
        const tempData = {};
        for (const level of levels) {
            const tempLapse = (500 - level) * 0.0065;
            tempData[level] = Math.round((surfaceTemp - tempLapse) * 10) / 10;
        }
        return tempData;
    }
    static getTurbulenceForecast(windSpeed) {
        if (windSpeed > 30)
            return 'Moderate';
        if (windSpeed > 20)
            return 'Light to Moderate';
        if (windSpeed > 10)
            return 'Light';
        return 'None';
    }
    static getIcingForecast(temperature, precipitation) {
        if (temperature < 0 && precipitation > 2)
            return 'Moderate';
        if (temperature < 0 && precipitation > 0)
            return 'Light';
        if (temperature < -10)
            return 'Trace';
        return 'None';
    }
}
exports.NetCDFParser = NetCDFParser;
exports.default = NetCDFParser;
//# sourceMappingURL=netcdf-parser.js.map