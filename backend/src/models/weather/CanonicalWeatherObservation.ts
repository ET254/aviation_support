/**
 * ============================================================================
 * CanonicalWeatherObservation
 * ----------------------------------------------------------------------------
 * Master weather model for the Kenya Aviation Weather Decision Support System.
 *
 * Every parser (METAR, SPECI, TAF, SIGMET, NetCDF, Radar, Satellite, etc.)
 * converts its output into this common format.
 *
 * All aviation services consume ONLY this object.
 * ============================================================================
 */

export type WeatherSource =
    | "METAR"
    | "SPECI"
    | "TAF"
    | "SIGMET"
    | "AIRMET"
    | "NETCDF"
    | "MODEL"
    | "MANUAL"
    | "RADAR"
    | "SATELLITE";

export type RunwayCondition =
    | "DRY"
    | "DAMP"
    | "WET"
    | "SLUSH"
    | "SNOW"
    | "ICE"
    | "UNKNOWN";

export type HazardSeverity =
    | "NONE"
    | "LIGHT"
    | "MODERATE"
    | "SEVERE"
    | "EXTREME";

export type FlightCategory =
    | "VFR"
    | "MVFR"
    | "IFR"
    | "LIFR";

export interface CloudLayer {

    amount:
        | "SKC"
        | "CLR"
        | "FEW"
        | "SCT"
        | "BKN"
        | "OVC";

    base: number;

    top?: number;

    type?:
        | "CU"
        | "TCU"
        | "CB"
        | "NS"
        | "ST"
        | "SC"
        | "CI"
        | "CS"
        | "AS"
        | "AC";
}

export interface CanonicalWeatherObservation {

    // ---------------------------------------------------------------------
    // Metadata
    // ---------------------------------------------------------------------

    observationId?: string;

    stationId: string;

    stationCode: string;

    stationName?: string;

    source: WeatherSource;

    observationType?:
    | "OBSERVED"
    | "FORECAST"
    | "NOWCAST"
    | "MODEL";

    relativeHumidity?: number;

    timestamp: Date;

    forecastTime?: Date;

    validFrom?: Date;

    validTo?: Date;

    issueTime?: Date;

    latitude?: number;

    longitude?: number;

    elevation?: number;

    terrainType?:
    | "HIGHLANDS"
    | "COASTAL"
    | "LAKE_REGION"
    | "SEMI_ARID"
    | "VALLEY_MOUNTAIN"
    | "PLAINS"
    | "DESERT";

    runwayOrientation?: number;

    primaryRunwayHeading?: number;


    secondaryRunwayHeading?: number;

    runwayLength?: number;

    runwayWidth?: number;

    runwaySurface?: string;

    // ---------------------------------------------------------------------
    // Temperature
    // ---------------------------------------------------------------------

    temperature: number;

    dewPoint: number;

    wetBulbTemperature?: number;

    heatIndex?: number;

    windChill?: number;

    densityAltitude?: number;

    pressureAltitude?: number;

    freezingLevel?: number;

    // ---------------------------------------------------------------------
    // Pressure
    // ---------------------------------------------------------------------

    qnh: number;

    qfe?: number;

    altimeter?: number;

    pressureTendency?: number;

    // ---------------------------------------------------------------------
    // Wind
    // ---------------------------------------------------------------------

    windDirection: number;

    windSpeed: number;

    windGust?: number;

    variableWind?: boolean;

    variableFrom?: number;

    variableTo?: number;

    crosswindComponent?: number;

    headwindComponent?: number;

    tailwindComponent?: number;

    lowLevelWindShear?: boolean;

    windShearHeight?: number;

    jetStreamSpeed?: number;

    jetStreamDirection?: number;

        // ---------------------------------------------------------------------
    // Visibility
    // ---------------------------------------------------------------------

    visibility: number;

    prevailingVisibility?: number;

    minimumVisibility?: number;

    visibilityNorth?: number;

    visibilitySouth?: number;

    visibilityEast?: number;

    visibilityWest?: number;

    runwayVisualRange?: number;

    rvr?: number;

    verticalVisibility?: number;

    obscurations?: string[];

    flightCategory?: FlightCategory;

    // ---------------------------------------------------------------------
    // Clouds
    // ---------------------------------------------------------------------

    cloudLayers?: CloudLayer[];

    cloudAmount?: number;

    cloudBase?: number;

    cloudTop?: number;

    cloudType?: string;

    ceiling?: number;

    brokenLayerHeight?: number;

    overcastLayerHeight?: number;

    convectiveClouds?: boolean;

    toweringCumulus?: boolean;

    cumulonimbus?: boolean;

    // ---------------------------------------------------------------------
    // Precipitation
    // ---------------------------------------------------------------------

    precipitationType?:
        | "NONE"
        | "RAIN"
        | "DRIZZLE"
        | "SNOW"
        | "SLEET"
        | "HAIL"
        | "FREEZING_RAIN"
        | "FREEZING_DRIZZLE"
        | "ICE_PELLETS";

    precipitationIntensity?:
        | "NONE"
        | "LIGHT"
        | "MODERATE"
        | "HEAVY"
        | "VIOLENT";

    precipitationRate?: number;

    accumulation?: number;

    // ---------------------------------------------------------------------
    // Runway
    // ---------------------------------------------------------------------

    runwayCondition?: RunwayCondition;

    runwayContaminationPercent?: number;

    runwayFrictionCoefficient?: number;

    brakingAction?:
        | "GOOD"
        | "GOOD_TO_MEDIUM"
        | "MEDIUM"
        | "MEDIUM_TO_POOR"
        | "POOR"
        | "UNRELIABLE";

    standingWater?: boolean;

    snowDepth?: number;

    slushDepth?: number;

    // ---------------------------------------------------------------------
    // Hazardous Weather
    // ---------------------------------------------------------------------

    thunderstorm?: boolean;

    lightning?: boolean;

    hail?: boolean;

    tornado?: boolean;

    funnelCloud?: boolean;

    squall?: boolean;

    dustStorm?: boolean;

    sandStorm?: boolean;

    volcanicAsh?: boolean;

    smoke?: boolean;

    blowingSnow?: boolean;

    blowingDust?: boolean;

    blowingSand?: boolean;

    fog?: boolean;

    mist?: boolean;

    haze?: boolean;

    freezingFog?: boolean;

    // ---------------------------------------------------------------------
    // Turbulence
    // ---------------------------------------------------------------------

    turbulence?: boolean;

    turbulenceSeverity?: HazardSeverity;

    turbulenceBase?: number;

    turbulenceTop?: number;

    clearAirTurbulence?: boolean;

    mountainWave?: boolean;

    rotorCloud?: boolean;

    // ---------------------------------------------------------------------
    // Icing
    // ---------------------------------------------------------------------

    icing?: boolean;

    icingSeverity?: HazardSeverity;

    icingBase?: number;

    icingTop?: number;

    supercooledLiquidWater?: boolean;

    freezingRain?: boolean;

    freezingDrizzle?: boolean;

        // ---------------------------------------------------------------------
    // Forecast Confidence & Quality
    // ---------------------------------------------------------------------

    confidence?: number;

    confidenceLevel?:
        | "VERY_LOW"
        | "LOW"
        | "MEDIUM"
        | "HIGH"
        | "VERY_HIGH";

    dataQuality?:
        | "RAW"
        | "QC_PENDING"
        | "QC_PASSED"
        | "ESTIMATED"
        | "MODELLED";

    forecastModel?:
        | "WRF"
        | "ECMWF"
        | "GFS"
        | "ICON"
        | "UKMO"
        | "KMD";

    modelRunTime?: Date;

    forecastHour?: number;

    observationAgeMinutes?: number;

    // ---------------------------------------------------------------------
    // Derived Aviation Indices
    // ---------------------------------------------------------------------

    densityIndex?: number;

    flightRiskIndex?: number;

    runwayRiskIndex?: number;

    weatherSeverityIndex?: number;

    operationalReadinessIndex?: number;

    // ---------------------------------------------------------------------
    // Airport Operational Status
    // ---------------------------------------------------------------------

    airportOperational?: boolean;

    runwayOperational?: boolean;

    departuresAllowed?: boolean;

    arrivalsAllowed?: boolean;

    vfrAllowed?: boolean;

    ifrRequired?: boolean;

    alternateAirportRecommended?: boolean;

    diversionRecommended?: boolean;

    holdingRecommended?: boolean;

    deicingRequired?: boolean;

    // ---------------------------------------------------------------------
    // Weather Warnings
    // ---------------------------------------------------------------------

    sigmetActive?: boolean;

    airmetActive?: boolean;

    metarIssued?: boolean;

    speciIssued?: boolean;

    tafIssued?: boolean;

    warningMessages?: string[];

    advisoryMessages?: string[];

    operationalMessages?: string[];

    // ---------------------------------------------------------------------
    // Raw Messages
    // ---------------------------------------------------------------------

    rawMETAR?: string;

    rawSPECI?: string;

    rawTAF?: string;

    rawSIGMET?: string;

    rawAIRMET?: string;

    // ---------------------------------------------------------------------
    // Remarks
    // ---------------------------------------------------------------------

    remarks?: string;

    notes?: string;

    // ---------------------------------------------------------------------
    // Audit
    // ---------------------------------------------------------------------

    createdAt?: Date;

    updatedAt?: Date;
}