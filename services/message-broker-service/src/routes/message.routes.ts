import { Router } from 'express';
import messageController from '../controllers/message.controller';

const router = Router();

/**
 * @route   POST /api/messages/publish
 * @desc    Publish a message to a queue or exchange
 * @access  Public
 */
router.post('/publish', messageController.publishMessage.bind(messageController));

/**
 * @route   POST /api/messages/queue
 * @desc    Create a new queue
 * @access  Public
 */
router.post('/queue', messageController.createQueue.bind(messageController));

/**
 * @route   POST /api/messages/bind
 * @desc    Bind a queue to an exchange
 * @access  Public
 */
router.post('/bind', messageController.bindQueue.bind(messageController));

/**
 * @route   GET /api/messages/queue/:queue
 * @desc    Get queue information
 * @access  Public
 */
router.get('/queue/:queue', messageController.getQueueInfo.bind(messageController));

/**
 * @route   DELETE /api/messages/queue/:queue
 * @desc    Delete a queue
 * @access  Public
 */
router.delete('/queue/:queue', messageController.deleteQueue.bind(messageController));

/**
 * @route   POST /api/messages/queue/:queue/purge
 * @desc    Purge all messages from a queue
 * @access  Public
 */
router.post('/queue/:queue/purge', messageController.purgeQueue.bind(messageController));

/**
 * @route   GET /api/messages/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', messageController.healthCheck.bind(messageController));

export default router;
