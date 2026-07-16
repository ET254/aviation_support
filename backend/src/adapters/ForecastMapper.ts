import {
    Forecast,
    RawForecast,
    IcingSeverity,
    PrecipitationType,
    CloudCoverage,
    WindForecast,
    TurbulenceSeverity,
    TemperatureForecast,
    PressureForecast,
    AirportOperationalStatus,
    FlightCategory,
    VisibilityOperationalStatus,
    VisibilityForecast,
    CloudForecast,
    PrecipitationForecast,
    TurbulenceForecast,
    IcingForecast,
    DensityAltitudeForecast,
    OperationalForecast,
    WindOperationalStatus,
    TemperatureOperationalStatus
} from "../models/forecast";

export class ForecastMapper {

    /**
     * Convert one RawForecast into a Forecast.
     */
    static fromRaw(raw: RawForecast): Forecast {

        return {

            stationId: raw.stationId,

            stationCode: raw.stationCode,

            stationName: raw.stationName,

            validFrom: new Date(raw.validTime),

            // Assume each forecast record represents one hour
            validTo: new Date(
                new Date(raw.validTime).getTime() + 60 * 60 * 1000
            ),

            forecastHour: raw.forecastHour,

            wind: this.mapWind(raw),

            temperature: this.mapTemperature(raw),

            pressure: this.mapPressure(raw),

            visibility: this.mapVisibility(raw),

            cloud: this.mapCloud(raw),

            precipitation: this.mapPrecipitation(raw),

            turbulence: this.mapTurbulence(raw),

            icing: this.mapIcing(raw),

            densityAltitude: this.mapDensityAltitude(raw),

            operational: this.mapOperational(raw),

            source: raw.sourceFile,

            generatedAt: new Date(raw.extractedAt),

            modelRun: raw.modelRun

        };

    }

    /**
     * Convert many forecasts.
     */
    static fromMany(rawForecasts: RawForecast[]): Forecast[] {

        return rawForecasts.map(

            raw => this.fromRaw(raw)

        );

    }

/**
 * ============================================================================
 * Wind Mapping
 * ============================================================================
 */

private static mapWind(raw: RawForecast): WindForecast {

    const speedMS = Math.sqrt(
        raw.u10 * raw.u10 +
        raw.v10 * raw.v10
    );

    // Convert m/s → knots
    const speedKT = speedMS * 1.94384;

    // Meteorological wind direction
    let direction =
        (270 - Math.atan2(raw.v10, raw.u10) * 180 / Math.PI) % 360;

    if (direction < 0) {
        direction += 360;
    }

    let status: WindOperationalStatus =
        WindOperationalStatus.NORMAL;

    if (speedKT >= 35) {
        status = WindOperationalStatus.CRITICAL;
    }
    else if (speedKT >= 25) {
        status = WindOperationalStatus.WARNING;
    }
    else if (speedKT >= 15) {
        status = WindOperationalStatus.CAUTION;
    }

    return {

        direction,

        speed: Number(speedKT.toFixed(1)),

        gust: undefined,

        uComponent: raw.u10,

        vComponent: raw.v10,

        verticalVelocity: raw.w,

        crosswindComponent: undefined,

        headwindComponent: undefined,

        tailwindComponent: undefined,

        windShear: false,

        operationalStatus: status

    };

}

/**
 * ============================================================================
 * Temperature Mapping
 * ============================================================================
 */

private static mapTemperature(
    raw: RawForecast
): TemperatureForecast {

    // Kelvin → Celsius
    const airTemperature = raw.t2 - 273.15;

    const surfaceTemperature =
        raw.skinTemperature - 273.15;

    const humidity =
        raw.relativeHumidity ?? 50;

    let status =
        TemperatureOperationalStatus.NORMAL;

    if (airTemperature >= 40) {

        status = TemperatureOperationalStatus.EXTREME;

    }
    else if (airTemperature >= 35) {

        status = TemperatureOperationalStatus.VERY_HOT;

    }
    else if (airTemperature >= 30) {

        status = TemperatureOperationalStatus.HOT;

    }

    return {

        airTemperature: Number(
            airTemperature.toFixed(1)
        ),

        surfaceTemperature: Number(
            surfaceTemperature.toFixed(1)
        ),

        dewPoint: undefined,

        relativeHumidity: humidity,

        apparentTemperature: undefined,

        isaDeviation: undefined,

        operationalStatus: status

    };

}

/**
 * ============================================================================
 * Pressure Mapping
 * ============================================================================
 */

private static mapPressure(
    raw: RawForecast
): PressureForecast {

    // Surface pressure in Pascals
    const surfacePressure = raw.surfacePressure;

    // Convert to hPa
    const qnh = surfacePressure / 100;

    // For now assume QFE ≈ QNH
    const qfe = qnh;

    /*
     * ICAO Standard Atmosphere approximation
     *
     * Pressure Altitude (ft)
     */

    const pressureAltitude =
        (1013.25 - qnh) * 30;

    return {

        surfacePressure,

        meanSeaLevelPressure: Number(
            qnh.toFixed(1)
        ),

        qnh: Number(
            qnh.toFixed(1)
        ),

        qfe: Number(
            qfe.toFixed(1)
        ),

        pressureAltitude: Math.round(
            pressureAltitude
        )

    };

}

/**
 * ============================================================================
 * Visibility Mapping
 * ============================================================================
 */

private static mapVisibility(
    raw: RawForecast
): VisibilityForecast {

    /*
     * Initial visibility estimate.
     *
     * This will later be replaced with a more advanced
     * algorithm using RH, cloud water, precipitation,
     * fog diagnostics and WRF visibility equations.
     */

    let visibility = 10000;

    if ((raw.relativeHumidity ?? 0) > 95) {

        visibility = 2000;

    }

    if ((raw.relativeHumidity ?? 0) > 98) {

        visibility = 800;

    }

    if ((raw.rainc + raw.rainnc) > 5) {

        visibility = Math.min(
            visibility,
            3000
        );

    }

    let category: FlightCategory;

    if (visibility >= 5000) {

        category = FlightCategory.VFR;

    }
    else if (visibility >= 3000) {

        category = FlightCategory.MVFR;

    }
    else if (visibility >= 1000) {

        category = FlightCategory.IFR;

    }
    else {

        category = FlightCategory.LIFR;

    }

    let status =
        VisibilityOperationalStatus.NORMAL;

    switch (category) {

        case FlightCategory.MVFR:

            status =
                VisibilityOperationalStatus.CAUTION;

            break;

        case FlightCategory.IFR:

            status =
                VisibilityOperationalStatus.LOW;

            break;

        case FlightCategory.LIFR:

            status =
                VisibilityOperationalStatus.VERY_LOW;

            break;

    }

    return {

        visibility,

        flightCategory: category,

        fog:
            (raw.relativeHumidity ?? 0) >= 98,

        mist:
            (raw.relativeHumidity ?? 0) >= 95
            &&
            (raw.relativeHumidity ?? 0) < 98,

        haze: false,

        dust: false,

        smoke: false,

        operationalStatus: status

    };

}

/**
 * ============================================================================
 * Cloud Mapping
 * ============================================================================
 */

private static mapCloud(
    raw: RawForecast
): CloudForecast {

    const fraction = raw.cloudFraction ?? 0;

    let coverage: CloudCoverage;

    if (fraction < 0.05) {

        coverage = CloudCoverage.SKC;

    }
    else if (fraction < 0.25) {

        coverage = CloudCoverage.FEW;

    }
    else if (fraction < 0.50) {

        coverage = CloudCoverage.SCT;

    }
    else if (fraction < 0.875) {

        coverage = CloudCoverage.BKN;

    }
    else {

        coverage = CloudCoverage.OVC;

    }

    /*
     * Initial cloud base estimate.
     *
     * Later this will be calculated from
     * geopotential height + cloud layers.
     */

    let base = 12000;

    if ((raw.relativeHumidity ?? 0) > 95) {

        base = 800;

    }
    else if ((raw.relativeHumidity ?? 0) > 90) {

        base = 2000;

    }
    else if ((raw.relativeHumidity ?? 0) > 80) {

        base = 5000;

    }

    return {

        coverage,

        base,

        top: undefined,

        ceiling:
            coverage === CloudCoverage.BKN ||
            coverage === CloudCoverage.OVC
                ? base
                : undefined,

        cumulonimbus:
            (raw.rainc + raw.rainnc) > 10,

        toweringCumulus:
            (raw.rainc + raw.rainnc) > 2

    };

}

/**
 * ============================================================================
 * Precipitation Mapping
 * ============================================================================
 */

private static mapPrecipitation(
    raw: RawForecast
): PrecipitationForecast {

    const convectiveRain = raw.rainc;

    const stratiformRain = raw.rainnc;

    const showerRain = raw.rainsh ?? 0;

    const totalRain =
        convectiveRain +
        stratiformRain +
        showerRain;

    let type = PrecipitationType.NONE;

    /*
     * Determine precipitation type
     */

    if ((raw.hail ?? 0) > 0) {

        type = PrecipitationType.HAIL;

    }
    else if ((raw.snow ?? 0) > 0) {

        type = PrecipitationType.SNOW;

    }
    else if (convectiveRain > 5) {

        type = PrecipitationType.THUNDERSTORM;

    }
    else if (totalRain > 1) {

        type = PrecipitationType.RAIN;

    }
    else if (totalRain > 0.1) {

        type = PrecipitationType.DRIZZLE;

    }

    /*
     * Estimate probability
     */

    let probability = 0;

    if (type !== PrecipitationType.NONE) {

        probability = Math.min(
            100,
            Math.round(totalRain * 20)
        );

    }

    return {

        type,

        rate: Number(
            totalRain.toFixed(2)
        ),

        probability,

        accumulation: Number(
            totalRain.toFixed(2)
        )

    };

}

/**
 * ============================================================================
 * Turbulence Mapping
 * ============================================================================
 */

private static mapTurbulence(
    raw: RawForecast
): TurbulenceForecast {

    /*
     * Estimate turbulence from vertical velocity.
     *
     * This is the first implementation.
     * Later we'll use:
     * - Wind shear
     * - Richardson Number
     * - TKE
     * - Mountain wave diagnostics
     * - Convective diagnostics
     */

    const verticalVelocity =
        Math.abs(raw.w ?? 0);

    let severity =
        TurbulenceSeverity.NONE;

    if (verticalVelocity >= 5) {

        severity = TurbulenceSeverity.SEVERE;

    }
    else if (verticalVelocity >= 3) {

        severity = TurbulenceSeverity.MODERATE;

    }
    else if (verticalVelocity >= 1) {

        severity = TurbulenceSeverity.LIGHT;

    }

    return {

        severity,

        lowLevel:
            raw.elevation < 2000 &&
            severity !== TurbulenceSeverity.NONE,

        mountainWave:
            raw.elevation > 1800 &&
            verticalVelocity > 3,

        clearAirTurbulence:
            severity !== TurbulenceSeverity.NONE &&
            (raw.rainc + raw.rainnc) < 0.1

    };

}

/**
 * ============================================================================
 * Icing Mapping
 * ============================================================================
 */

private static mapIcing(
    raw: RawForecast
): IcingForecast {

    /*
     * First implementation.
     *
     * Aviation icing usually occurs when:
     *  - Temperature is near or below freezing
     *  - Moisture/cloud water exists
     *
     * Later this will use:
     *  - QCLOUD
     *  - QICE
     *  - Relative Humidity
     *  - Vertical profiles
     *  - Supercooled Liquid Water
     */

    const airTemperature =
        raw.t2 - 273.15;

    const humidity =
        raw.relativeHumidity ?? 50;

    let severity =
        IcingSeverity.NONE;

    if (
        airTemperature <= 0 &&
        humidity >= 95
    ) {

        severity = IcingSeverity.SEVERE;

    }
    else if (
        airTemperature <= 2 &&
        humidity >= 90
    ) {

        severity = IcingSeverity.MODERATE;

    }
    else if (
        airTemperature <= 5 &&
        humidity >= 80
    ) {

        severity = IcingSeverity.LIGHT;

    }

    /*
     * Approximate freezing level.
     *
     * This will later be replaced using
     * full WRF vertical temperature profiles.
     */

    const freezingLevel =
        airTemperature <= 0
            ? raw.elevation
            : raw.elevation +
              (airTemperature * 1000);

    return {

        severity,

        freezingLevel: Math.round(
            freezingLevel
        ),

        supercooledLiquidWater:
            severity !== IcingSeverity.NONE &&
            humidity >= 90

    };

}

/**
 * ============================================================================
 * Density Altitude Mapping
 * ============================================================================
 */

private static mapDensityAltitude(
    raw: RawForecast
): DensityAltitudeForecast {

    /*
     * Convert temperature to Celsius
     */

    const temperature =
        raw.t2 - 273.15;

    /*
     * Convert pressure to hPa
     */

    const pressure =
        raw.surfacePressure / 100;

    /*
     * Pressure Altitude
     *
     * ICAO approximation
     */

    const pressureAltitude =
        raw.elevation +
        ((1013.25 - pressure) * 30);

    /*
     * ISA Temperature
     */

    const isaTemperature =
        15 -
        (raw.elevation / 1000) * 2;

    /*
     * ISA Temperature Deviation
     */

    const isaDeviation =
        temperature - isaTemperature;

    /*
     * Density Altitude
     */

    const densityAltitude =
        pressureAltitude +
        (120 * isaDeviation);

    /*
     * Performance Penalty
     */

    let performancePenalty = 0;

    if (densityAltitude > 1000) {

        performancePenalty =
            (densityAltitude - 1000) / 100;

    }

    if (performancePenalty > 100) {

        performancePenalty = 100;

    }

    return {

        densityAltitude: Math.round(
            densityAltitude
        ),

        pressureAltitude: Math.round(
            pressureAltitude
        ),

        performancePenalty: Number(
            performancePenalty.toFixed(1)
        )

    };

}

/**
 * ============================================================================
 * Operational Mapping
 * ============================================================================
 */

private static mapOperational(
    raw: RawForecast
): OperationalForecast {

    /*
     * Build all forecast components needed for operational assessment.
     */

    const wind = this.mapWind(raw);

    const visibility = this.mapVisibility(raw);

    const cloud = this.mapCloud(raw);

    const precipitation = this.mapPrecipitation(raw);

    const turbulence = this.mapTurbulence(raw);

    const icing = this.mapIcing(raw);

    const densityAltitude =
        this.mapDensityAltitude(raw);

    const remarks: string[] = [];

    let status =
        AirportOperationalStatus.NORMAL;

    /*
     * Wind
     */

    if (
        wind.operationalStatus ===
        WindOperationalStatus.CRITICAL
    ) {

        status = AirportOperationalStatus.CLOSED;

        remarks.push(
            "Critical surface wind."
        );

    }
    else if (
    wind.operationalStatus ===
    WindOperationalStatus.WARNING
) {

    status = AirportOperationalStatus.RESTRICTED;

    remarks.push(
        "Strong surface wind."
    );

}
else if (
    wind.operationalStatus ===
    WindOperationalStatus.CAUTION &&
    status === AirportOperationalStatus.NORMAL
) {

    status = AirportOperationalStatus.CAUTION;

    remarks.push(
        "Moderate surface wind."
    );

}

    /*
     * Visibility
     */

    if (
        visibility.flightCategory ===
        FlightCategory.LIFR
    ) {

        status = AirportOperationalStatus.CLOSED;

        remarks.push(
            "Very low visibility."
        );

    }
    else if (
    visibility.flightCategory ===
    FlightCategory.IFR &&
    status !== AirportOperationalStatus.CLOSED
) {

    status = AirportOperationalStatus.RESTRICTED;

    remarks.push(
        "IFR conditions."
    );

}
else if (
    visibility.flightCategory ===
    FlightCategory.MVFR &&
    status === AirportOperationalStatus.NORMAL
) {

    status = AirportOperationalStatus.CAUTION;

    remarks.push(
        "Marginal VFR conditions."
    );

}

    /*
     * Ceiling
     */

    if (
        cloud.coverage === CloudCoverage.OVC &&
        (cloud.ceiling ?? 99999) < 500
    ) {

        status = AirportOperationalStatus.RESTRICTED;

        remarks.push(
            "Very low cloud ceiling."
        );

    }

    /*
     * Thunderstorms
     */

    if (
        precipitation.type ===
        PrecipitationType.THUNDERSTORM
    ) {

        status = AirportOperationalStatus.CLOSED;

        remarks.push(
            "Thunderstorm affecting airport."
        );

    }

    /*
     * Turbulence
     */

    if (
        turbulence.severity ===
        TurbulenceSeverity.SEVERE
    ) {

        status = AirportOperationalStatus.RESTRICTED;

        remarks.push(
            "Severe turbulence."
        );

    }

    /*
     * Icing
     */

    if (
        icing.severity ===
        IcingSeverity.SEVERE
    ) {

        status = AirportOperationalStatus.RESTRICTED;

        remarks.push(
            "Severe icing."
        );

    }

    /*
 * Density Altitude
 */

if (
    densityAltitude.performancePenalty >= 30
) {

    status = AirportOperationalStatus.RESTRICTED;

    remarks.push(
        "Reduced aircraft performance."
    );

}
else if (
    densityAltitude.performancePenalty >= 15 &&
    status === AirportOperationalStatus.NORMAL
) {

    status = AirportOperationalStatus.CAUTION;

    remarks.push(
        "Moderately reduced aircraft performance."
    );

}

    return {

        status,

        runwaySuitable:
            status !== AirportOperationalStatus.CLOSED,

        departureAllowed:
            status === AirportOperationalStatus.NORMAL ||
            status === AirportOperationalStatus.CAUTION,

        arrivalAllowed:
            status !== AirportOperationalStatus.CLOSED,

        vfrAllowed:
            visibility.flightCategory ===
            FlightCategory.VFR,

        ifrRequired:
            visibility.flightCategory ===
                FlightCategory.IFR ||
            visibility.flightCategory ===
                FlightCategory.LIFR,

        remarks

    };

}

}