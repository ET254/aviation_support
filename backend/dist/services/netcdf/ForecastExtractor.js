"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForecastExtractor = void 0;
const NetCDFReader_1 = require("./NetCDFReader");
class ForecastExtractor {
    static extract(filePath) {
        const metadata = NetCDFReader_1.NetCDFReader.describe(filePath);
        return {
            metadata,
            variables: {
                temperature: [22, 24, 26],
                windSpeed: [12, 18, 25],
                humidity: [65, 72, 80],
            },
        };
    }
}
exports.ForecastExtractor = ForecastExtractor;
//# sourceMappingURL=ForecastExtractor.js.map