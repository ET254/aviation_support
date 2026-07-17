"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPagination = exports.calculateDistance = exports.isValidWMOId = exports.isValidICAOCode = exports.retry = exports.sleep = exports.fahrenheitToCelsius = exports.celsiusToFahrenheit = exports.hPaToInHg = exports.feetToMeters = exports.metersToFeet = exports.knotsToMs = exports.knotsToKmh = exports.formatDate = exports.generateUUID = exports.sendError = exports.sendSuccess = void 0;
const logger_1 = require("./logger");
const sendSuccess = (res, data, message, statusCode = 200) => {
    const response = {
        success: true,
        message: message || 'Success',
        data,
    };
    return res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, error, statusCode = 500) => {
    const response = {
        success: false,
        error,
    };
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
exports.generateUUID = generateUUID;
const formatDate = (date) => {
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
exports.formatDate = formatDate;
const knotsToKmh = (knots) => {
    return knots * 1.852;
};
exports.knotsToKmh = knotsToKmh;
const knotsToMs = (knots) => {
    return knots * 0.514444;
};
exports.knotsToMs = knotsToMs;
const metersToFeet = (meters) => {
    return meters * 3.28084;
};
exports.metersToFeet = metersToFeet;
const feetToMeters = (feet) => {
    return feet * 0.3048;
};
exports.feetToMeters = feetToMeters;
const hPaToInHg = (hPa) => {
    return hPa * 0.02953;
};
exports.hPaToInHg = hPaToInHg;
const celsiusToFahrenheit = (celsius) => {
    return (celsius * 9 / 5) + 32;
};
exports.celsiusToFahrenheit = celsiusToFahrenheit;
const fahrenheitToCelsius = (fahrenheit) => {
    return (fahrenheit - 32) * 5 / 9;
};
exports.fahrenheitToCelsius = fahrenheitToCelsius;
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.sleep = sleep;
const retry = async (fn, retries = 3, delay = 1000) => {
    try {
        return await fn();
    }
    catch (error) {
        if (retries <= 0)
            throw error;
        logger_1.logger.warn(`Retry attempt ${4 - retries} failed, retrying...`);
        await (0, exports.sleep)(delay);
        return (0, exports.retry)(fn, retries - 1, delay * 2);
    }
};
exports.retry = retry;
const isValidICAOCode = (code) => {
    return /^[A-Z]{4}$/.test(code) && code.length === 4;
};
exports.isValidICAOCode = isValidICAOCode;
const isValidWMOId = (id) => {
    return /^\d{5}$/.test(id);
};
exports.isValidWMOId = isValidWMOId;
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
exports.calculateDistance = calculateDistance;
const getPagination = (page = 1, limit = 10, total = 0) => {
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
exports.getPagination = getPagination;
//# sourceMappingURL=helpers.js.map