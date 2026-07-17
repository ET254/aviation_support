import { Response } from 'express';
export declare const sendSuccess: <T>(res: Response, data: T, message?: string, statusCode?: number) => Response;
export declare const sendError: (res: Response, error: string, statusCode?: number) => Response;
export declare const generateUUID: () => string;
export declare const formatDate: (date: Date | string) => string;
export declare const knotsToKmh: (knots: number) => number;
export declare const knotsToMs: (knots: number) => number;
export declare const metersToFeet: (meters: number) => number;
export declare const feetToMeters: (feet: number) => number;
export declare const hPaToInHg: (hPa: number) => number;
export declare const celsiusToFahrenheit: (celsius: number) => number;
export declare const fahrenheitToCelsius: (fahrenheit: number) => number;
export declare const sleep: (ms: number) => Promise<void>;
export declare const retry: <T>(fn: () => Promise<T>, retries?: number, delay?: number) => Promise<T>;
export declare const isValidICAOCode: (code: string) => boolean;
export declare const isValidWMOId: (id: string) => boolean;
export declare const calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
export declare const getPagination: (page?: number, limit?: number, total?: number) => {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
};
//# sourceMappingURL=helpers.d.ts.map