import { Response } from 'express';
import { ApiResponse } from '../types';
import { logger } from './logger';

/**
 * Send success response
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message: message || 'Success',
    data,
  };
  return res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  error: string,
  statusCode: number = 500
): Response => {
  const response: ApiResponse = {
    success: false,
    error,
  };
  return res.status(statusCode).json(response);
};

/**
 * Generate UUID
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Format date for display
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC',
  });
};

/**
 * Convert knots to km/h
 */
export const knotsToKmh = (knots: number): number => {
  return knots * 1.852;
};

/**
 * Convert knots to m/s
 */
export const knotsToMs = (knots: number): number => {
  return knots * 0.514444;
};

/**
 * Convert meters to feet
 */
export const metersToFeet = (meters: number): number => {
  return meters * 3.28084;
};

/**
 * Convert feet to meters
 */
export const feetToMeters = (feet: number): number => {
  return feet * 0.3048;
};

/**
 * Convert hPa to inHg
 */
export const hPaToInHg = (hPa: number): number => {
  return hPa * 0.02953;
};

/**
 * Convert Celsius to Fahrenheit
 */
export const celsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9/5) + 32;
};

/**
 * Convert Fahrenheit to Celsius
 */
export const fahrenheitToCelsius = (fahrenheit: number): number => {
  return (fahrenheit - 32) * 5/9;
};

/**
 * Sleep function for delays
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    logger.warn(`Retry attempt ${4 - retries} failed, retrying...`);
    await sleep(delay);
    return retry(fn, retries - 1, delay * 2);
  }
};

/**
 * Validate ICAO airport code
 */
export const isValidICAOCode = (code: string): boolean => {
  // ICAO codes are 4 characters: first letter is region, second is country
  return /^[A-Z]{4}$/.test(code) && code.length === 4;
};

/**
 * Validate WMO station ID
 */
export const isValidWMOId = (id: string): boolean => {
  // WMO IDs are typically 5 digits
  return /^\d{5}$/.test(id);
};

/**
 * Calculate distance between two points (Haversine formula)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Generate pagination metadata
 */
export const getPagination = (
  page: number = 1,
  limit: number = 10,
  total: number = 0
): {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
} => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
};