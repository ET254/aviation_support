export type FlightCategory = "VFR" | "MVFR" | "IFR" | "LIFR";

export type OverallRisk =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "EXTREME";

export interface RiskAssessment {
  overallRisk: OverallRisk;

  flightCategory: FlightCategory;

  visibilityRisk: string;

  ceilingRisk: string;

  windRisk: string;

  crosswindRisk: string;

  turbulenceRisk: string;

  icingRisk: string;

  thunderstormRisk: string;

  densityAltitudeRisk: string;

  recommendation: string;

  warnings: string[];
}

export class RiskAssessmentService {
  static assess(weather: any): RiskAssessment {
    const visibility =
      Number(weather.visibility ?? 99999);

    const cloudBase =
      Number(weather.cloudBase ?? 99999);

    const wind =
      Number(weather.windSpeed ?? 0);

    const crosswind =
      Math.abs(Number(weather.crosswindComponent ?? 0));

    const densityAltitude =
      Number(weather.densityAltitude ?? 0);

    const precipitation =
      Number(weather.precipitationIntensity ?? 0);

    const flightCategory =
      this.determineFlightCategory(
        visibility,
        cloudBase
      );

    const overallRisk =
      this.determineOverallRisk(
        flightCategory
      );

    const warnings: string[] = [];

    const visibilityRisk =
      this.evaluateVisibility(visibility);

    const ceilingRisk =
      this.evaluateCeiling(cloudBase);

    const windRisk =
      this.evaluateWind(wind);

    const crosswindRisk =
      this.evaluateCrosswind(crosswind);

    const turbulenceRisk =
      this.evaluateTurbulence(wind);

    const icingRisk =
      this.evaluateIcing(weather.temperature);

    const thunderstormRisk =
      this.evaluateThunderstorm(
        precipitation
      );

    const densityAltitudeRisk =
      this.evaluateDensityAltitude(
        densityAltitude
      );

    if (
      visibilityRisk === "CRITICAL"
    ) {
      warnings.push(
        "Low Visibility Procedures Required"
      );
    }

    if (
      crosswindRisk === "HIGH"
    ) {
      warnings.push(
        "Crosswind exceeds operational limits"
      );
    }

    if (
      icingRisk !== "NONE"
    ) {
      warnings.push(
        "Icing conditions expected"
      );
    }

    if (
      thunderstormRisk !== "NONE"
    ) {
      warnings.push(
        "Thunderstorm activity expected"
      );
    }

    if (
      densityAltitudeRisk === "HIGH"
    ) {
      warnings.push(
        "High density altitude may reduce aircraft performance"
      );
    }

    return {
      overallRisk,

      flightCategory,

      visibilityRisk,

      ceilingRisk,

      windRisk,

      crosswindRisk,

      turbulenceRisk,

      icingRisk,

      thunderstormRisk,

      densityAltitudeRisk,

      recommendation:
        this.getRecommendation(
          overallRisk
        ),

      warnings,
    };
  }

  private static determineFlightCategory(
    visibility: number,
    cloudBase: number
  ): FlightCategory {
    if (
      visibility < 800 ||
      cloudBase < 200
    )
      return "LIFR";

    if (
      visibility < 1600 ||
      cloudBase < 500
    )
      return "IFR";

    if (
      visibility < 5000 ||
      cloudBase < 1000
    )
      return "MVFR";

    return "VFR";
  }

  private static determineOverallRisk(
    category: FlightCategory
  ): OverallRisk {
    switch (category) {
      case "VFR":
        return "LOW";

      case "MVFR":
        return "MEDIUM";

      case "IFR":
        return "HIGH";

      case "LIFR":
        return "EXTREME";
    }
  }

  private static evaluateVisibility(
    visibility: number
  ) {
    if (visibility < 800)
      return "CRITICAL";

    if (visibility < 1500)
      return "POOR";

    if (visibility < 5000)
      return "CAUTION";

    return "GOOD";
  }

  private static evaluateCeiling(
    cloudBase: number
  ) {
    if (cloudBase < 200)
      return "CRITICAL";

    if (cloudBase < 500)
      return "POOR";

    if (cloudBase < 1000)
      return "CAUTION";

    return "GOOD";
  }

  private static evaluateWind(
    wind: number
  ) {
    if (wind >= 40)
      return "EXTREME";

    if (wind >= 30)
      return "HIGH";

    if (wind >= 20)
      return "MEDIUM";

    return "LOW";
  }

  private static evaluateCrosswind(
    crosswind: number
  ) {
    if (crosswind >= 30)
      return "HIGH";

    if (crosswind >= 20)
      return "MEDIUM";

    if (crosswind >= 12)
      return "CAUTION";

    return "GOOD";
  }

  private static evaluateTurbulence(
    wind: number
  ) {
    if (wind >= 45)
      return "SEVERE";

    if (wind >= 30)
      return "MODERATE";

    if (wind >= 20)
      return "LIGHT";

    return "NONE";
  }

  private static evaluateIcing(
    temperature?: number
  ) {
    if (temperature === undefined)
      return "NONE";

    if (
      temperature <= 2 &&
      temperature >= -20
    )
      return "POSSIBLE";

    return "NONE";
  }

  private static evaluateThunderstorm(
    precipitation: number
  ) {
    if (precipitation >= 20)
      return "HIGH";

    if (precipitation >= 10)
      return "MEDIUM";

    if (precipitation >= 5)
      return "LOW";

    return "NONE";
  }

  private static evaluateDensityAltitude(
    densityAltitude: number
  ) {
    if (densityAltitude >= 9000)
      return "HIGH";

    if (densityAltitude >= 7000)
      return "MEDIUM";

    if (densityAltitude >= 5000)
      return "LOW";

    return "NORMAL";
  }

  private static getRecommendation(
    risk: OverallRisk
  ) {
    switch (risk) {
      case "LOW":
        return "Normal Operations";

      case "MEDIUM":
        return "Exercise Caution";

      case "HIGH":
        return "Operational Restrictions Recommended";

      case "EXTREME":
        return "Operations Not Recommended";
    }
  }
}