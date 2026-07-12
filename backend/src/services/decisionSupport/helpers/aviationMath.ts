/**
 * ============================================================================
 * Aviation Mathematics Helper Library
 * ICAO / FAA Standard Aviation Calculations
 * ============================================================================
 */

export class AviationMath {

  /**
   * Degrees → Radians
   */
  static toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Radians → Degrees
   */
  static toDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
  }

  /**
   * Normalize heading to 0-359°
   */
  static normalizeHeading(heading: number): number {
    let h = heading % 360;

    if (h < 0) {
      h += 360;
    }

    return h;
  }

  /**
   * Smallest angular difference
   *
   * Example:
   * runway 090
   * wind 130
   * difference = 40°
   */
  static angleDifference(a: number, b: number): number {

    const diff =
      Math.abs(
        this.normalizeHeading(a) -
        this.normalizeHeading(b)
      );

    return diff > 180 ? 360 - diff : diff;
  }

  /**
   * Crosswind Component
   *
   * ICAO Formula
   *
   * Crosswind = WindSpeed × sin(angle)
   */
  static calculateCrosswind(

    windDirection: number,
    windSpeed: number,
    runwayHeading: number

  ): number {

    const angle =
      this.toRadians(
        this.angleDifference(
          windDirection,
          runwayHeading
        )
      );

    return windSpeed * Math.sin(angle);
  }

  /**
   * Headwind Component
   *
   * Positive = Headwind
   * Negative = Tailwind
   */
  static calculateHeadwind(

    windDirection: number,
    windSpeed: number,
    runwayHeading: number

  ): number {

    const angle =
      this.toRadians(
        this.angleDifference(
          windDirection,
          runwayHeading
        )
      );

    return windSpeed * Math.cos(angle);
  }

  /**
   * Tailwind Component
   *
   * Always positive
   */
  static calculateTailwind(

    windDirection: number,
    windSpeed: number,
    runwayHeading: number

  ): number {

    const hw =
      this.calculateHeadwind(
        windDirection,
        windSpeed,
        runwayHeading
      );

    return hw < 0 ? Math.abs(hw) : 0;
  }

  /**
   * Pressure Altitude
   *
   * PA = Elevation + (1013.25 - QNH) × 30
   */
  static calculatePressureAltitude(

    elevationFeet: number,
    qnh: number

  ): number {

    return elevationFeet + ((1013.25 - qnh) * 30);
  }

  /**
   * Density Altitude
   *
   * ICAO Approximation
   */
  static calculateDensityAltitude(

    elevationFeet: number,
    temperature: number,
    qnh: number

  ): number {

    const pressureAltitude =
      this.calculatePressureAltitude(
        elevationFeet,
        qnh
      );

    const isaTemperature =
      15 - (pressureAltitude / 1000) * 2;

    return pressureAltitude +
      (120 * (temperature - isaTemperature));
  }

  /**
   * Saturation Vapour Pressure
   */
  static saturationVaporPressure(
    temperature: number
  ): number {

    return 6.112 *
      Math.exp(
        (17.67 * temperature) /
        (temperature + 243.5)
      );
  }

  /**
   * Relative Humidity
   */
  static calculateRelativeHumidity(

    temperature: number,
    dewPoint: number

  ): number {

    const es =
      this.saturationVaporPressure(
        temperature
      );

    const e =
      this.saturationVaporPressure(
        dewPoint
      );

    return (e / es) * 100;
  }

  /**
   * Dew Point Depression
   */
  static dewPointSpread(

    temperature: number,
    dewPoint: number

  ): number {

    return temperature - dewPoint;
  }

  /**
   * Celsius → Kelvin
   */
  static celsiusToKelvin(
    temperature: number
  ): number {

    return temperature + 273.15;
  }

  /**
   * Knots → m/s
   */
  static knotsToMetersPerSecond(
    knots: number
  ): number {

    return knots * 0.514444;
  }

  /**
   * m/s → knots
   */
  static metersPerSecondToKnots(
    ms: number
  ): number {

    return ms / 0.514444;
  }

  /**
   * Nautical Miles → Kilometres
   */
  static nauticalMilesToKm(
    nm: number
  ): number {

    return nm * 1.852;
  }

  /**
   * Kilometres → Nautical Miles
   */
  static kmToNauticalMiles(
    km: number
  ): number {

    return km / 1.852;
  }

  /**
   * Feet → Metres
   */
  static feetToMeters(
    feet: number
  ): number {

    return feet * 0.3048;
  }

  /**
   * Metres → Feet
   */
  static metersToFeet(
    meters: number
  ): number {

    return meters / 0.3048;
  }

  /**
   * Calculate Flight Category
   *
   * ICAO Standard
   */
  static determineFlightCategory(

    visibility: number,
    cloudBase: number

  ):
    | "VFR"
    | "MVFR"
    | "IFR"
    | "LIFR" {

    if (
      visibility < 800 ||
      cloudBase < 200
    ) {
      return "LIFR";
    }

    if (
      visibility < 3000 ||
      cloudBase < 500
    ) {
      return "IFR";
    }

    if (
      visibility < 5000 ||
      cloudBase < 1000
    ) {
      return "MVFR";
    }

    return "VFR";
  }
  /**
 * Clamp a number between a minimum and maximum value.
 */
static clamp(
    value: number,
    min: number,
    max: number
): number {

    return Math.min(
        Math.max(value, min),
        max
    );

}

}