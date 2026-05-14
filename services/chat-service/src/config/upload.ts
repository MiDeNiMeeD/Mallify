import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { Request } from 'express';

export const CHAT_UPLOAD_ROOT = path.join(__dirname, '../../uploads/chat');

const MAX_FILE_SIZE = Number(process.env.CHAT_UPLOAD_MAX_BYTES || 50 * 1024 * 1024);
const MAX_FILES = 10;

const ALLOWED_MIME_PREFIXES = ['image/', 'video/', 'audio/'];
const ALLOWED_DOCUMENT_MIMES = new Set([
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
]);

const sanitizeName = (raw: string): string =>
  raw
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .toLowerCase()
    .slice(0, 80) || 'file';

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await fs.mkdir(CHAT_UPLOAD_ROOT, { recursive: true });
      cb(null, CHAT_UPLOAD_ROOT);
    } catch (err) {
      cb(err as Error, CHAT_UPLOAD_ROOT);
    }
  },
  filename: (_req, file, cb) => {
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${suffix}-${sanitizeName(file.originalname)}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const mime = file.mimetype || '';
  if (ALLOWED_MIME_PREFIXES.some((p) => mime.startsWith(p))) {
    cb(null, true);
    return;
  }
  if (ALLOWED_DOCUMENT_MIMES.has(mime)) {
    cb(null, true);
    return;
  }
  cb(new Error(`Unsupported file type: ${mime}`));
};

export const uploadChatAttachments = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
}).array('files', MAX_FILES);

export const detectMessageType = (
  mime: string
): 'image' | 'video' | 'audio' | 'voice' | 'file' => {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  return 'file';
};
