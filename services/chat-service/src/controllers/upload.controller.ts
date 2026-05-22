import { Request, Response } from 'express';
import { detectMessageType } from '../config/upload';

// Store path-only URLs so each client (web on ngrok, mobile on LAN) resolves
// them against its own API base. Baking the uploader's host into the URL
// breaks cross-platform: ngrok URLs are unreachable from LAN-only devices,
// and LAN URLs are unreachable from remote browsers.
const publicUrlFor = (filename: string): string => `/api/chat/uploads/${filename}`;

export const uploadAttachments = async (req: Request, res: Response): Promise<void> => {
  const files = (req.files as Express.Multer.File[]) || [];
  if (!files.length) {
    res.status(400).json({ error: 'No files uploaded' });
    return;
  }
  const attachments = files.map((f) => ({
    url: publicUrlFor(f.filename),
    mimeType: f.mimetype,
    name: f.originalname,
    size: f.size,
    suggestedType: detectMessageType(f.mimetype),
  }));
  res.status(201).json({ attachments });
};
