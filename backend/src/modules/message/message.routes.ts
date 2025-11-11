import { Router } from 'express';
import { messageController } from './message.controller';
import { authenticateToken } from '../../middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/messages/search
 * @desc    Search messages
 * @access  Private
 */
router.get('/search', messageController.searchMessages);

/**
 * @route   GET /api/conversations/:conversationId/messages
 * @desc    Get messages for a conversation
 * @access  Private
 */
router.get('/conversations/:conversationId/messages', messageController.getMessages);

/**
 * @route   POST /api/messages
 * @desc    Send a new message
 * @access  Private
 */
router.post('/', messageController.sendMessage);

/**
 * @route   PUT /api/messages/:messageId
 * @desc    Edit a message
 * @access  Private
 */
router.put('/:messageId', messageController.editMessage);

/**
 * @route   DELETE /api/messages/:messageId
 * @desc    Delete a message
 * @access  Private
 */
router.delete('/:messageId', messageController.deleteMessage);

/**
 * @route   POST /api/messages/:messageId/reactions
 * @desc    Add reaction to a message
 * @access  Private
 */
router.post('/:messageId/reactions', messageController.addReaction);

/**
 * @route   DELETE /api/messages/:messageId/reactions
 * @desc    Remove reaction from a message
 * @access  Private
 */
router.delete('/:messageId/reactions', messageController.removeReaction);

/**
 * @route   POST /api/conversations/:conversationId/read
 * @desc    Mark messages as read
 * @access  Private
 */
router.post('/conversations/:conversationId/read', messageController.markAsRead);

export default router;
