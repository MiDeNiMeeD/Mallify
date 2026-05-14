import { Router } from 'express';
import { getContacts, resolveUsers } from '../controllers/contacts.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getContacts);
router.get('/resolve', resolveUsers);

export default router;
