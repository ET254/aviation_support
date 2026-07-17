"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForecastWorker = void 0;
const logger_1 = require("../utils/logger");
const netcdf_parser_1 = require("../utils/netcdf-parser");
const AirportForecastProcessor_1 = require("../services/netcdf/AirportForecastProcessor");
class ForecastWorker {
    static async run(filePath) {
        logger_1.logger.info(`Processing forecast file ${filePath}`);
        const parsed = await netcdf_parser_1.NetCDFParser.parseFile(filePath);
        const airportImpact = AirportForecastProcessor_1.AirportForecastProcessor.process(filePath);
        return { parsed, airportImpact };
    }
}
exports.ForecastWorker = ForecastWorker;
//# sourceMappingURL=forecastWorker.js.map