import { Request, Response } from 'express';
import { detectMessageType } from '../config/upload';

const publicUrlFor = (req: Request, filename: string): string => {
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol;
  const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || '';
  return `${proto}://${host}/api/chat/uploads/${filename}`;
};

export const uploadAttachments = async (req: Request, res: Response): Promise<void> => {
  const files = (req.files as Express.Multer.File[]) || [];
  if (!files.length) {
    res.status(400).json({ error: 'No files uploaded' });
    return;
  }
  const attachments = files.map((f) => ({
    url: publicUrlFor(req, f.filename),
    mimeType: f.mimetype,
    name: f.originalname,
    size: f.size,
    suggestedType: detectMessageType(f.mimetype),
  }));
  res.status(201).json({ attachments });
};
