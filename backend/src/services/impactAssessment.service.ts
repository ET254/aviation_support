// backend/src/services/impactAssessment.service.ts

import { RiskAssessment } from "./riskAssessment.service";

export interface OperationalImpact {
  pilots: string[];
  atc: string[];
  dispatch: string[];
  airportOperations: string[];
  meteorologists: string[];
  maintenance: string[];
  summary: string[];
}

export class ImpactAssessmentService {

  static assess(
    weather: any,
    risk: RiskAssessment
  ): OperationalImpact {

    const impact: OperationalImpact = {
      pilots: [],
      atc: [],
      dispatch: [],
      airportOperations: [],
      meteorologists: [],
      maintenance: [],
      summary: [],
    };

    //----------------------------------------------------
    // LOW VISIBILITY
    //----------------------------------------------------

    if ((weather.visibility ?? 99999) < 800) {

      impact.pilots.push(
        "CAT II/III approach required."
      );

      impact.pilots.push(
        "Expect missed approach possibility."
      );

      impact.atc.push(
        "Activate Low Visibility Procedures."
      );

      impact.atc.push(
        "Increase aircraft separation."
      );

      impact.dispatch.push(
        "Expect arrival and departure delays."
      );

      impact.airportOperations.push(
        "Increase runway lighting intensity."
      );

      impact.meteorologists.push(
        "Issue SPECI immediately."
      );

      impact.summary.push(
        "Critical low visibility."
      );

    }

    //----------------------------------------------------
    // MODERATE VISIBILITY
    //----------------------------------------------------

    else if ((weather.visibility ?? 99999) < 5000) {

      impact.pilots.push(
        "Instrument approach likely."
      );

      impact.atc.push(
        "Monitor traffic spacing."
      );

      impact.dispatch.push(
        "Monitor destination weather."
      );

      impact.summary.push(
        "Reduced visibility."
      );

    }

    //----------------------------------------------------
    // LOW CLOUD
    //----------------------------------------------------

    if ((weather.cloudBase ?? 99999) < 500) {

      impact.pilots.push(
        "Low ceiling may affect approach minima."
      );

      impact.atc.push(
        "Prepare IFR operations."
      );

      impact.dispatch.push(
        "Review alternate airport."
      );

      impact.summary.push(
        "Low cloud ceiling."
      );

    }

    //----------------------------------------------------
    // STRONG WIND
    //----------------------------------------------------

    if ((weather.windSpeed ?? 0) >= 30) {

      impact.pilots.push(
        "Expect strong surface wind."
      );

      impact.airportOperations.push(
        "Secure loose ground equipment."
      );

      impact.maintenance.push(
        "Protect maintenance work areas."
      );

      impact.summary.push(
        "Strong wind conditions."
      );

    }

    //----------------------------------------------------
    // CROSSWIND
    //----------------------------------------------------

    if (Math.abs(weather.crosswindComponent ?? 0) >= 20) {

      impact.pilots.push(
        "Crosswind approaching operational limits."
      );

      impact.atc.push(
        "Recommend runway with lower crosswind."
      );

      impact.dispatch.push(
        "Verify aircraft crosswind capability."
      );

      impact.summary.push(
        "High crosswind."
      );

    }

    //----------------------------------------------------
    // TAILWIND
    //----------------------------------------------------

    if ((weather.tailwindComponent ?? 0) > 10) {

      impact.pilots.push(
        "Tailwind landing performance reduced."
      );

      impact.atc.push(
        "Consider runway change."
      );

      impact.summary.push(
        "Tailwind exceeds preferred values."
      );

    }

    //----------------------------------------------------
    // THUNDERSTORM
    //----------------------------------------------------

    if (risk.thunderstormRisk !== "NONE") {

      impact.pilots.push(
        "Avoid thunderstorm cells."
      );

      impact.pilots.push(
        "Expect severe turbulence."
      );

      impact.atc.push(
        "Increase arrival spacing."
      );

      impact.dispatch.push(
        "Plan alternate routing."
      );

      impact.airportOperations.push(
        "Suspend apron activities if necessary."
      );

      impact.meteorologists.push(
        "Issue SIGMET."
      );

      impact.summary.push(
        "Thunderstorm risk."
      );

    }

    //----------------------------------------------------
    // ICING
    //----------------------------------------------------

    if (risk.icingRisk !== "NONE") {

      impact.pilots.push(
        "Airframe icing possible."
      );

      impact.dispatch.push(
        "Review icing forecast."
      );

      impact.maintenance.push(
        "Prepare de-icing equipment."
      );

      impact.summary.push(
        "Icing conditions."
      );

    }

    //----------------------------------------------------
    // TURBULENCE
    //----------------------------------------------------

    if (risk.turbulenceRisk !== "NONE") {

      impact.pilots.push(
        "Expect turbulence."
      );

      impact.dispatch.push(
        "Advise crew."
      );

      impact.meteorologists.push(
        "Monitor turbulence evolution."
      );

      impact.summary.push(
        "Turbulence expected."
      );

    }

    //----------------------------------------------------
    // DENSITY ALTITUDE
    //----------------------------------------------------

    if ((weather.densityAltitude ?? 0) > 8000) {

      impact.pilots.push(
        "Reduced climb performance."
      );

      impact.dispatch.push(
        "Review aircraft payload."
      );

      impact.dispatch.push(
        "Consider fuel adjustments."
      );

      impact.summary.push(
        "High density altitude."
      );

    }

    //----------------------------------------------------
    // HEAVY RAIN
    //----------------------------------------------------

    if ((weather.precipitationIntensity ?? 0) > 20) {

      impact.pilots.push(
        "Heavy precipitation during approach."
      );

      impact.airportOperations.push(
        "Inspect runway drainage."
      );

      impact.airportOperations.push(
        "Check runway friction."
      );

      impact.summary.push(
        "Heavy rainfall."
      );

    }

    //----------------------------------------------------
    // OVERALL RISK
    //----------------------------------------------------

    switch (risk.overallRisk) {

      case "LOW":

        impact.summary.push(
          "Operations normal."
        );

        break;

      case "MEDIUM":

        impact.summary.push(
          "Exercise operational caution."
        );

        break;

      case "HIGH":

        impact.summary.push(
          "Operational restrictions recommended."
        );

        impact.atc.push(
          "Increase monitoring."
        );

        break;

      case "EXTREME":

        impact.summary.push(
          "Airport operations may require suspension."
        );

        impact.atc.push(
          "Consider airport closure."
        );

        impact.dispatch.push(
          "Delay departures."
        );

        impact.dispatch.push(
          "Evaluate alternate airports."
        );

        break;
    }

    //----------------------------------------------------
    // REMOVE DUPLICATES
    //----------------------------------------------------

    impact.pilots = [...new Set(impact.pilots)];

    impact.atc = [...new Set(impact.atc)];

    impact.dispatch = [...new Set(impact.dispatch)];

    impact.airportOperations = [...new Set(impact.airportOperations)];

    impact.meteorologists = [...new Set(impact.meteorologists)];

    impact.maintenance = [...new Set(impact.maintenance)];

    impact.summary = [...new Set(impact.summary)];

    return impact;
  }

}