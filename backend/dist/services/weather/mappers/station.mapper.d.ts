import { Station } from "@prisma/client";
import { CanonicalWeatherObservation } from "../../../models/weather/CanonicalWeatherObservation";
export declare class StationMapper {
    static map(station: Station): Partial<CanonicalWeatherObservation>;
}
//# sourceMappingURL=station.mapper.d.ts.map