export declare class StationRepository {
    static list(): Promise<{
        name: string;
        code: string;
        wmoId: string | null;
        latitude: number;
        longitude: number;
        elevation: number;
        terrainType: import(".prisma/client").$Enums.TerrainType;
        topographyDescription: string;
        runwayLength: number | null;
        runwayOrientation: string | null;
        runwaySurface: string | null;
        category: import(".prisma/client").$Enums.AirportCategory;
        isActive: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    static getById(id: string): Promise<{
        name: string;
        code: string;
        wmoId: string | null;
        latitude: number;
        longitude: number;
        elevation: number;
        terrainType: import(".prisma/client").$Enums.TerrainType;
        topographyDescription: string;
        runwayLength: number | null;
        runwayOrientation: string | null;
        runwaySurface: string | null;
        category: import(".prisma/client").$Enums.AirportCategory;
        isActive: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    static getActive(): Promise<{
        name: string;
        code: string;
        wmoId: string | null;
        latitude: number;
        longitude: number;
        elevation: number;
        terrainType: import(".prisma/client").$Enums.TerrainType;
        topographyDescription: string;
        runwayLength: number | null;
        runwayOrientation: string | null;
        runwaySurface: string | null;
        category: import(".prisma/client").$Enums.AirportCategory;
        isActive: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
//# sourceMappingURL=station.repository.d.ts.map