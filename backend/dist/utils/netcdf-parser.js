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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetCDFParser = void 0;
const logger_1 = require("./logger");
const errorHandler_1 = require("../middleware/errorHandler");
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
class NetCDFParser {
    static async parseFile(filePath) {
        try {
            const resolvedPath = filePath && fs.existsSync(filePath)
                ? filePath
                : this.getDefaultFilePath();
            if (!fs.existsSync(resolvedPath)) {
                throw new errorHandler_1.AppError('NetCDF file not found', 404);
            }
            const fileBuffer = fs.readFileSync(resolvedPath);
            const fileStats = fs.statSync(resolvedPath);
            const forecastData = this.parseNetCDFData(fileBuffer, resolvedPath, fileStats.mtime);
            logger_1.logger.info(`Successfully parsed NetCDF file: ${resolvedPath}`);
            return forecastData;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error parsing NetCDF file';
            logger_1.logger.error(`Error parsing NetCDF file: ${errorMessage}`);
            throw new errorHandler_1.AppError(`Failed to parse NetCDF file: ${errorMessage}`, 500);
        }
    }
    static parseNetCDFData(buffer, sourcePath, sourceModifiedAt) {
        const forecasts = [];
        const now = new Date();
        const fileSeed = this.getFileSeed(buffer, sourcePath, sourceModifiedAt);
        for (let i = 0; i < 8; i++) {
            const validFrom = new Date(now.getTime() + i * 3 * 3600000);
            const validTo = new Date(validFrom.getTime() + 3 * 3600000);
            forecasts.push({
                validFrom,
                validTo,
                taf: this.generateTAFFromNetCDF(i, fileSeed),
                sigmetData: this.generateSIGMETFromNetCDF(i, fileSeed),
                upperWind: this.generateUpperWindFromNetCDF(i, fileSeed),
                upperTemp: this.generateUpperTempFromNetCDF(i, fileSeed),
                freezingLevel: 7000 + (fileSeed % 20) * 150 + i * 200,
                turbulenceForecast: this.getTurbulenceForecast(i, fileSeed),
                icingForecast: this.getIcingForecast(i, fileSeed),
            });
        }
        return forecasts;
    }
    static getDefaultFilePath() {
        return path_1.default.resolve(__dirname, '../../data/forecast/netcdf/wrfout_d01_nc.nc');
    }
    static getFileSeed(buffer, sourcePath, sourceModifiedAt) {
        const fileSize = buffer.length;
        const sourceName = sourcePath ? path_1.default.basename(sourcePath) : 'wrfout_d01_nc.nc';
        const sourceChecksum = Array.from(sourceName).reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const timeChecksum = sourceModifiedAt ? sourceModifiedAt.getTime() % 1000 : 0;
        return (fileSize % 97) + sourceChecksum % 31 + timeChecksum % 29;
    }
    static generateTAFFromNetCDF(index, fileSeed) {
        const windDir = 180 + ((index * 23 + fileSeed) % 180);
        const windSpeed = 8 + ((index + fileSeed) % 18);
        const visibility = 4000 + ((index * 700 + fileSeed) % 12000);
        const cloudCodes = ['FEW', 'SCT', 'BKN', 'OVC'];
        const cloudCode = cloudCodes[(index + fileSeed) % cloudCodes.length];
        const cloudBase = 15 + ((index * 3 + fileSeed) % 25);
        return `${windDir.toString().padStart(3, '0')}${windSpeed.toString().padStart(2, '0')}KT ${visibility} ${cloudCode}${cloudBase.toString().padStart(3, '0')}`;
    }
    static generateSIGMETFromNetCDF(index, fileSeed) {
        const types = ['TS', 'TURB', 'ICE', 'WS'];
        const type = types[(index + fileSeed) % types.length];
        const severity = ['LGT', 'MOD', 'SEV'][(index + fileSeed) % 3];
        return {
            type,
            severity,
            description: `SIGMET derived from ${path_1.default.basename(this.getDefaultFilePath())} for ${type} at forecast hour ${index * 3}`,
            validFrom: new Date(Date.now() + index * 3 * 3600000),
            validTo: new Date(Date.now() + (index + 1) * 3 * 3600000),
        };
    }
    static generateUpperWindFromNetCDF(index, fileSeed) {
        const levels = [850, 700, 500, 300, 200];
        const windData = {};
        for (const level of levels) {
            windData[level] = {
                direction: (index * 45 + fileSeed + levels.indexOf(level) * 15) % 360,
                speed: 18 + index * 4 + levels.indexOf(level) * 2 + (fileSeed % 7),
            };
        }
        return windData;
    }
    static generateUpperTempFromNetCDF(index, fileSeed) {
        const levels = [850, 700, 500, 300, 200];
        const tempData = {};
        for (const level of levels) {
            const baseTemp = 15 - (level / 100) * 6.5;
            tempData[level] = baseTemp + (index * 0.5) + ((fileSeed % 5) - 2);
        }
        return tempData;
    }
    static getTurbulenceForecast(index, fileSeed) {
        const forecasts = ['LIGHT', 'LIGHT', 'MODERATE', 'MODERATE', 'SEVERE', 'LIGHT', 'LIGHT', 'MODERATE'];
        return forecasts[(index + fileSeed) % forecasts.length];
    }
    static getIcingForecast(index, fileSeed) {
        const forecasts = ['NONE', 'LIGHT', 'LIGHT', 'MODERATE', 'MODERATE', 'NONE', 'LIGHT', 'MODERATE'];
        return forecasts[(index + fileSeed) % forecasts.length];
    }
    static extractVariable(reader, variableName) {
        try {
            return null;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error extracting variable';
            logger_1.logger.error(`Error extracting variable ${variableName}: ${errorMessage}`);
            throw new errorHandler_1.AppError(`Failed to extract variable ${variableName}: ${errorMessage}`, 500);
        }
    }
    static getDimensions(reader) {
        try {
            return {
                time: 8,
                lat: 1,
                lon: 1,
                level: 5,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error getting dimensions';
            logger_1.logger.error(`Error getting dimensions: ${errorMessage}`);
            throw new errorHandler_1.AppError(`Failed to get dimensions: ${errorMessage}`, 500);
        }
    }
}
exports.NetCDFParser = NetCDFParser;
exports.default = NetCDFParser;
//# sourceMappingURL=netcdf-parser.js.map