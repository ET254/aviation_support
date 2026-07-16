export interface RunwayInfo {
    designation: string;
    heading: number;
    reciprocalHeading: number;
    length: number;
    surface: string;
}
export interface RunwayWindComponents {
    runway: string;
    heading: number;
    crosswind: number;
    headwind: number;
    tailwind: number;
    windAngle: number;
}
export declare class RunwayMath {
    static runwayNumberToHeading(runway: number): number;
    static reciprocalHeading(heading: number): number;
    static parseOrientation(orientation: string): number[];
    static calculateComponents(runwayHeading: number, windDirection: number, windSpeed: number): RunwayWindComponents;
    static runwayScore(crosswind: number, tailwind: number): number;
    static runwayStatus(crosswind: number, tailwind: number): string;
    static selectBestRunway(orientation: string, windDirection: number, windSpeed: number): RunwayWindComponents;
    static isOperational(crosswind: number, tailwind: number, maxCrosswind?: number, maxTailwind?: number): boolean;
    static landingDistanceCorrection(tailwind: number, runwayWet: boolean): number;
    static takeoffDistanceCorrection(tailwind: number, densityAltitude: number): number;
}
//# sourceMappingURL=runwayMath.d.ts.map