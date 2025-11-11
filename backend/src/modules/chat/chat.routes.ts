import { Router } from 'express';
import { chatController } from './chat.controller';
import { authenticateToken } from '../../middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/conversations
 * @desc    Get all conversations for authenticated user
 * @access  Private
 */
router.get('/', chatController.getConversations);

/**
 * @route   GET /api/conversations/:conversationId
 * @desc    Get conversation by ID
 * @access  Private
 */
router.get('/:conversationId', chatController.getConversation);

/**
 * @route   POST /api/conversations
 * @desc    Create or get private conversation
 * @access  Private
 */
router.post('/', chatController.getOrCreatePrivateConversation);

/**
 * @route   DELETE /api/conversations/:conversationId
 * @desc    Delete conversation
 * @access  Private
 */
router.delete('/:conversationId', chatController.deleteConversation);

/**
 * @route   POST /api/conversations/groups
 * @desc    Create a group conversation
 * @access  Private
 */
router.post('/groups', chatController.createGroup);

/**
 * @route   PUT /api/conversations/:conversationId
 * @desc    Update group details
 * @access  Private
 */
router.put('/:conversationId', chatController.updateGroup);

/**
 * @route   POST /api/conversations/:conversationId/members
 * @desc    Add member to group
 * @access  Private
 */
router.post('/:conversationId/members', chatController.addMember);

/**
 * @route   DELETE /api/conversations/:conversationId/members/:memberId
 * @desc    Remove member from group
 * @access  Private
 */
router.delete('/:conversationId/members/:memberId', chatController.removeMember);

export default router;
