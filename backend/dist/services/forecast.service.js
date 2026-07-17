"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForecastService = void 0;
class ForecastService {
    static generateTimeline(forecasts, start, end) {
        const timeline = [];
        const interval = 3600000;
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
    static getConditionsAtTime(forecasts, time) {
        const activeForecast = forecasts.find(f => f.validFrom <= time && f.validTo >= time);
        if (!activeForecast) {
            return { status: 'No forecast available' };
        }
        if (activeForecast.taf) {
            return this.parseTAF(activeForecast.taf, time);
        }
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
    static parseTAF(taf, time) {
        const parts = taf.split(' ');
        const result = {
            raw: taf,
            timestamp: time,
        };
        const windIndex = parts.findIndex(p => /^\d{5}KT$/.test(p));
        if (windIndex !== -1) {
            const wind = parts[windIndex];
            result.windDirection = parseInt(wind.substring(0, 3), 10);
            result.windSpeed = parseInt(wind.substring(3, 5), 10);
        }
        const visIndex = parts.findIndex(p => /^\d{4}$/.test(p) && parseInt(p, 10) > 1000);
        if (visIndex !== -1) {
            result.visibility = parseInt(parts[visIndex], 10);
        }
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
    static parseSIGMET(sigmetData) {
        if (typeof sigmetData === 'string') {
            return {
                raw: sigmetData,
                type: this.detectSIGMETType(sigmetData),
                severity: this.detectSIGMETSeverity(sigmetData),
            };
        }
        return sigmetData;
    }
    static detectSIGMETType(sigmet) {
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
    static detectSIGMETSeverity(sigmet) {
        if (sigmet.includes('SEV'))
            return 'SEVERE';
        if (sigmet.includes('MOD'))
            return 'MODERATE';
        if (sigmet.includes('LGT'))
            return 'LIGHT';
        return 'UNKNOWN';
    }
    static async processNetCDFData(filePath) {
        const forecasts = [];
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
    static generateSampleTAF(time) {
        const windDir = Math.floor(Math.random() * 360);
        const windSpeed = 5 + Math.floor(Math.random() * 20);
        const visibility = 5000 + Math.floor(Math.random() * 10000);
        const cloudCodes = ['FEW', 'SCT', 'BKN', 'OVC'];
        const cloudCode = cloudCodes[Math.floor(Math.random() * cloudCodes.length)];
        const cloudBase = 10 + Math.floor(Math.random() * 30);
        return `${windDir.toString().padStart(3, '0')}${windSpeed.toString().padStart(2, '0')}KT ${visibility} ${cloudCode}${cloudBase.toString().padStart(3, '0')}`;
    }
    static generateSampleSIGMET(time) {
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
    static generateSampleUpperWind(time) {
        const levels = [850, 700, 500, 300, 200];
        const windData = {};
        for (const level of levels) {
            windData[level] = {
                direction: Math.floor(Math.random() * 360),
                speed: 10 + Math.floor(Math.random() * 50),
            };
        }
        return windData;
    }
    static generateSampleUpperTemp(time) {
        const levels = [850, 700, 500, 300, 200];
        const tempData = {};
        for (const level of levels) {
            const baseTemp = 15 - (level / 100) * 6.5;
            tempData[level] = baseTemp + (Math.random() * 10 - 5);
        }
        return tempData;
    }
}
exports.ForecastService = ForecastService;
//# sourceMappingURL=forecast.service.js.map