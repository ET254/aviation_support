"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirportForecastProcessor = void 0;
const ForecastExtractor_1 = require("./ForecastExtractor");
const GridInterpolator_1 = require("./GridInterpolator");
class AirportForecastProcessor {
    static process(filePath) {
        const extracted = ForecastExtractor_1.ForecastExtractor.extract(filePath);
        const interpolated = GridInterpolator_1.GridInterpolator.interpolate(extracted.variables);
        return {
            filePath,
            extracted,
            interpolated,
            airportImpact: 'Monitor runway configuration and prepare possible delays.',
        };
    }
}
exports.AirportForecastProcessor = AirportForecastProcessor;
//# sourceMappingURL=AirportForecastProcessor.js.map