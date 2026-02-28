import { Router } from 'express';
import {
  createAuditLog,
  getAuditLogs,
  getAuditLogById
} from '../controllers/audit.controller';

const router = Router();

router.post('/', createAuditLog);
router.get('/', getAuditLogs);
router.get('/:id', getAuditLogById);

export default router;
