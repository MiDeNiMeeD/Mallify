import { Router } from 'express';
import {
  sendMessage,
  listMessages,
  editMessage,
  deleteMessage,
  reactToMessage,
  removeReaction,
  pinMessage,
  forwardMessage,
  markDelivered,
  searchMessages,
  getMessage,
} from '../controllers/message.controller';
import { requireAuth } from '../middleware/auth';
import { loadConversation } from '../middleware/conversationAccess';

const router = Router();

router.use(requireAuth);

router.get('/search', searchMessages);
router.post('/', sendMessage);
router.post('/delivered', markDelivered);

router.get('/conversation/:id', loadConversation(), listMessages);

router.get('/:id', getMessage);
router.patch('/:id', editMessage);
router.delete('/:id', deleteMessage);
router.post('/:id/react', reactToMessage);
router.delete('/:id/react', removeReaction);
router.post('/:id/pin', pinMessage);
router.post('/:id/forward', forwardMessage);

export default router;
