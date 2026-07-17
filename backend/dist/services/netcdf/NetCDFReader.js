"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetCDFReader = void 0;
class NetCDFReader {
    static describe(filePath) {
        return {
            filePath,
            kind: 'netcdf',
            metadata: {
                variables: ['temperature', 'wind', 'humidity', 'precipitation'],
                dimensions: ['time', 'lat', 'lon', 'level'],
            },
        };
    }
}
exports.NetCDFReader = NetCDFReader;
//# sourceMappingURL=NetCDFReader.js.map