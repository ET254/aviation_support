"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolcanicAshMapper = void 0;
class VolcanicAshMapper {
    static map(weather, observation) {
        observation.volcanicAsh =
            this.detectVolcanicAsh(observation);
        if (observation.volcanicAsh) {
            observation.airportOperational = false;
            observation.runwayOperational = false;
            observation.departuresAllowed = false;
            observation.arrivalsAllowed = false;
            observation.diversionRecommended = true;
            observation.alternateAirportRecommended = true;
            observation.holdingRecommended = false;
            observation.warningMessages ??= [];
            observation.warningMessages.push("VOLCANIC ASH DETECTED - FLIGHT OPERATIONS SHOULD NOT CONTINUE.");
        }
    }
    static detectVolcanicAsh(wx) {
        if (wx.volcanicAsh === true)
            return true;
        if (wx.rawMETAR?.toUpperCase().includes("VA")) {
            return true;
        }
        if (wx.rawSPECI?.toUpperCase().includes("VA")) {
            return true;
        }
        if (wx.rawSIGMET?.toUpperCase().includes("VA")) {
            return true;
        }
        if (wx.warningMessages?.some(message => message.toUpperCase().includes("VOLCANIC") ||
            message.toUpperCase().includes("ASH"))) {
            return true;
        }
        return false;
    }
}
exports.VolcanicAshMapper = VolcanicAshMapper;
//# sourceMappingURL=volcanicAsh.mapper.js.map