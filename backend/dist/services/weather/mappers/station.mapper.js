"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StationMapper = void 0;
class StationMapper {
    static map(station) {
        return {
            stationId: station.id,
            stationCode: station.code,
            stationName: station.name,
            latitude: station.latitude,
            longitude: station.longitude,
            elevation: station.elevation,
            runwayLength: station.runwayLength ?? undefined,
            runwaySurface: station.runwaySurface ?? undefined,
            terrainType: station.terrainType,
            runwayOrientation: station.runwayOrientation
                ? Number(station.runwayOrientation)
                : undefined
        };
    }
}
exports.StationMapper = StationMapper;
//# sourceMappingURL=station.mapper.js.map