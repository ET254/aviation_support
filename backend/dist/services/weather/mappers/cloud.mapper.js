"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudMapper = void 0;
const client_1 = require("@prisma/client");
class CloudMapper {
    static map(weather, observation) {
        observation.cloudAmount =
            weather.cloudAmount ?? 0;
        observation.cloudBase =
            weather.cloudBase ?? undefined;
        observation.cloudTop =
            undefined;
        observation.cloudType =
            this.mapCloudType(weather.cloudType);
        observation.ceiling =
            this.calculateCeiling(weather);
        observation.brokenLayerHeight =
            weather.cloudType === client_1.CloudType.BROKEN
                ? weather.cloudBase ?? undefined
                : undefined;
        observation.overcastLayerHeight =
            weather.cloudType === client_1.CloudType.OVERCAST
                ? weather.cloudBase ?? undefined
                : undefined;
        observation.convectiveClouds =
            this.isConvective(observation.cloudType);
        observation.cumulonimbus =
            observation.cloudType === "CB";
        observation.toweringCumulus =
            observation.cloudType === "TCU";
        observation.cloudLayers =
            this.buildLayers(weather);
    }
    static mapCloudType(type) {
        if (!type)
            return undefined;
        switch (type) {
            case client_1.CloudType.CLEAR:
                return "CLR";
            case client_1.CloudType.FEW:
                return "FEW";
            case client_1.CloudType.SCATTERED:
                return "SCT";
            case client_1.CloudType.BROKEN:
                return "BKN";
            case client_1.CloudType.OVERCAST:
                return "OVC";
            case client_1.CloudType.VERTICAL_DEVELOPMENT:
                return "TCU";
            default:
                return undefined;
        }
    }
    static buildLayers(weather) {
        if (weather.cloudAmount == null ||
            weather.cloudBase == null) {
            return [];
        }
        let amount;
        const oktas = weather.cloudAmount;
        if (oktas <= 0)
            amount = "CLR";
        else if (oktas <= 2)
            amount = "FEW";
        else if (oktas <= 4)
            amount = "SCT";
        else if (oktas <= 7)
            amount = "BKN";
        else
            amount = "OVC";
        return [
            {
                amount,
                base: weather.cloudBase,
                type: this.layerType(weather.cloudType)
            }
        ];
    }
    static layerType(type) {
        if (!type)
            return undefined;
        switch (type) {
            case client_1.CloudType.VERTICAL_DEVELOPMENT:
                return "TCU";
            default:
                return undefined;
        }
    }
    static calculateCeiling(weather) {
        if (weather.cloudBase == null ||
            weather.cloudType == null) {
            return undefined;
        }
        switch (weather.cloudType) {
            case client_1.CloudType.BROKEN:
            case client_1.CloudType.OVERCAST:
                return weather.cloudBase;
            default:
                return undefined;
        }
    }
    static isConvective(type) {
        return (type === "CB" ||
            type === "TCU");
    }
}
exports.CloudMapper = CloudMapper;
//# sourceMappingURL=cloud.mapper.js.map