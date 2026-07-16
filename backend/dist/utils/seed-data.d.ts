export declare const additionalThresholds: ({
    parameter: string;
    minValue: number;
    maxValue: number;
    severityLevel: "RESTRICTED";
    actionRequired: string;
    userRole: "ATC";
} | {
    parameter: string;
    minValue: number;
    maxValue: number;
    severityLevel: "CAUTION";
    actionRequired: string;
    userRole: "PILOT";
} | {
    parameter: string;
    minValue: number;
    maxValue: number;
    severityLevel: "MONITOR";
    actionRequired: string;
    userRole: "DISPATCHER";
})[];
export declare const sampleWeatherData: ({
    temperature: number;
    windDirection: number;
    windSpeed: number;
    gustSpeed: number;
    visibility: number;
    rvr: number;
    pressureQnh: number;
    pressureQfe: number;
    humidity: number;
    dewPoint: number;
    cloudAmount: number;
    cloudBase: number;
    cloudType: "SCATTERED";
    precipitationType: "NONE";
    precipitationIntensity: number;
} | {
    temperature: number;
    windDirection: number;
    windSpeed: number;
    gustSpeed: number;
    visibility: number;
    rvr: number;
    pressureQnh: number;
    pressureQfe: number;
    humidity: number;
    dewPoint: number;
    cloudAmount: number;
    cloudBase: number;
    cloudType: "BROKEN";
    precipitationType: "RAIN";
    precipitationIntensity: number;
})[];
export declare const seedDatabase: () => Promise<void>;
//# sourceMappingURL=seed-data.d.ts.map