"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiple = exports.uploadSingle = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const errorHandler_1 = require("./errorHandler");
const uuid_1 = require("uuid");
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}-${Date.now()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = config_1.config.upload.allowedMimeTypes;
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new errorHandler_1.AppError('Invalid file type. Only CSV and Excel files are allowed.', 400), false);
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: config_1.config.upload.maxFileSize,
    },
    fileFilter,
});
exports.uploadSingle = exports.upload.single('file');
exports.uploadMultiple = exports.upload.array('files', 5);
//# sourceMappingURL=upload.js.map