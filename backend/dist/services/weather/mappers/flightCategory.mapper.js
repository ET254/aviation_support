"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightCategoryMapper = void 0;
class FlightCategoryMapper {
    static map(observation) {
        observation.flightCategory =
            this.calculateCategory(observation);
        observation.vfrAllowed =
            observation.flightCategory === "VFR" ||
                observation.flightCategory === "MVFR";
        observation.ifrRequired =
            observation.flightCategory === "IFR" ||
                observation.flightCategory === "LIFR";
    }
    static calculateCategory(wx) {
        const visibility = wx.visibility ?? 99999;
        const ceiling = this.determineCeiling(wx);
        if (visibility < 1600 ||
            ceiling < 500) {
            return "LIFR";
        }
        if (visibility < 4800 ||
            ceiling < 1000) {
            return "IFR";
        }
        if (visibility < 8000 ||
            ceiling < 3000) {
            return "MVFR";
        }
        return "VFR";
    }
    static determineCeiling(wx) {
        if (wx.ceiling != null) {
            return wx.ceiling;
        }
        if (wx.overcastLayerHeight != null) {
            return wx.overcastLayerHeight;
        }
        if (wx.brokenLayerHeight != null) {
            return wx.brokenLayerHeight;
        }
        if (wx.cloudLayers?.length) {
            const ceilingLayers = wx.cloudLayers.filter(layer => layer.amount === "BKN" ||
                layer.amount === "OVC");
            if (ceilingLayers.length > 0) {
                return Math.min(...ceilingLayers.map(layer => layer.base));
            }
        }
        return 99999;
    }
}
exports.FlightCategoryMapper = FlightCategoryMapper;
//# sourceMappingURL=flightCategory.mapper.js.map