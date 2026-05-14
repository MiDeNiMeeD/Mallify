import { Router } from 'express';
import {
  openOrCreateConversation,
  listConversations,
  getConversation,
  togglePin,
  toggleArchive,
  toggleMute,
  markRead,
  clearHistory,
  deleteConversation,
  listPinnedMessages,
} from '../controllers/conversation.controller';
import { requireAuth } from '../middleware/auth';
import { loadConversation } from '../middleware/conversationAccess';

const router = Router();

router.use(requireAuth);

router.get('/', listConversations);
router.post('/', openOrCreateConversation);
router.get('/:id', loadConversation(), getConversation);
router.patch('/:id/pin', loadConversation(), togglePin);
router.patch('/:id/archive', loadConversation(), toggleArchive);
router.patch('/:id/mute', loadConversation(), toggleMute);
router.post('/:id/read', loadConversation(), markRead);
router.post('/:id/clear', loadConversation(), clearHistory);
router.delete('/:id', loadConversation(), deleteConversation);
router.get('/:id/pinned', loadConversation(), listPinnedMessages);

export default router;
