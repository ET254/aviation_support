import multer from 'multer';
import path from 'path';
import { config } from '../config';
import { AppError } from './errorHandler';
import { v4 as uuidv4 } from 'uuid';

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = config.upload.allowedMimeTypes;
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only CSV and Excel files are allowed.', 400), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
  fileFilter,
});

export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', 5);