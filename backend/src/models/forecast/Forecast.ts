import { WindForecast } from "./WindForecast";
import { TemperatureForecast } from "./TemperatureForecast";
import { PressureForecast } from "./PressureForecast";
import { VisibilityForecast } from "./VisibilityForecast";
import { CloudForecast } from "./CloudForecast";
import { PrecipitationForecast } from "./PrecipitationForecast";
import { TurbulenceForecast } from "./TurbulenceForecast";
import { IcingForecast } from "./IcingForecast";
import { DensityAltitudeForecast } from "./DensityAltitudeForecast";
import { OperationalForecast } from "./OperationalForecast";

/**
 * ============================================================================
 * Canonical Forecast Model
 * ============================================================================
 */

export interface Forecast {

    /**
     * Station
     */
    stationId: string;

    stationCode: string;

    stationName?: string;

    /**
     * Forecast validity
     */
    validFrom: Date;

    validTo: Date;

    forecastHour: number;

    /**
     * Weather Forecast Components
     */
    wind: WindForecast;

    temperature: TemperatureForecast;

    pressure: PressureForecast;

    visibility: VisibilityForecast;

    cloud: CloudForecast;

    precipitation: PrecipitationForecast;

    turbulence: TurbulenceForecast;

    icing: IcingForecast;

    densityAltitude: DensityAltitudeForecast;

    operational: OperationalForecast;

    /**
     * Metadata
     */
    source: string;

    generatedAt: Date;

    modelRun?: string;

}