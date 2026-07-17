export declare class ForecastRepository {
    static findActiveByStation(stationId: string): Promise<{
        stationId: string;
        validFrom: Date;
        validTo: Date;
        taf: string | null;
        sigmetData: import("@prisma/client/runtime/library").JsonValue | null;
        upperWind: import("@prisma/client/runtime/library").JsonValue | null;
        upperTemp: import("@prisma/client/runtime/library").JsonValue | null;
        freezingLevel: number | null;
        turbulenceForecast: string | null;
        icingForecast: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        source: string;
        fileReference: string | null;
    } | null>;
    static create(payload: any): Promise<{
        stationId: string;
        validFrom: Date;
        validTo: Date;
        taf: string | null;
        sigmetData: import("@prisma/client/runtime/library").JsonValue | null;
        upperWind: import("@prisma/client/runtime/library").JsonValue | null;
        upperTemp: import("@prisma/client/runtime/library").JsonValue | null;
        freezingLevel: number | null;
        turbulenceForecast: string | null;
        icingForecast: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        source: string;
        fileReference: string | null;
    }>;
}
//# sourceMappingURL=forecast.repository.d.ts.map