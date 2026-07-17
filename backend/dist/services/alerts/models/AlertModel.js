"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertStatus = exports.AlertCategory = void 0;
var AlertCategory;
(function (AlertCategory) {
    AlertCategory["VISIBILITY"] = "VISIBILITY";
    AlertCategory["WIND"] = "WIND";
    AlertCategory["RUNWAY"] = "RUNWAY";
    AlertCategory["CLOUD"] = "CLOUD";
    AlertCategory["ICING"] = "ICING";
    AlertCategory["TURBULENCE"] = "TURBULENCE";
    AlertCategory["THUNDERSTORM"] = "THUNDERSTORM";
    AlertCategory["PRECIPITATION"] = "PRECIPITATION";
    AlertCategory["DENSITY_ALTITUDE"] = "DENSITY_ALTITUDE";
    AlertCategory["VOLCANIC_ASH"] = "VOLCANIC_ASH";
    AlertCategory["GENERAL"] = "GENERAL";
})(AlertCategory || (exports.AlertCategory = AlertCategory = {}));
var AlertStatus;
(function (AlertStatus) {
    AlertStatus["ACTIVE"] = "ACTIVE";
    AlertStatus["ACKNOWLEDGED"] = "ACKNOWLEDGED";
    AlertStatus["RESOLVED"] = "RESOLVED";
    AlertStatus["CANCELLED"] = "CANCELLED";
})(AlertStatus || (exports.AlertStatus = AlertStatus = {}));
//# sourceMappingURL=AlertModel.js.map