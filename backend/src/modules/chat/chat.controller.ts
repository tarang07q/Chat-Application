import { Response } from 'express';
import { chatService } from './chat.service';
import { asyncHandler } from '../../middlewares/errorHandler';
import { AuthRequest } from '../../middlewares/auth';

class ChatController {
  // Get all conversations for the authenticated user
  getConversations = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    
    const conversations = await chatService.getUserConversations(userId);
    
    res.json({
      status: 'success',
      data: { conversations },
    });
  });

  // Get or create a private conversation
  getOrCreatePrivateConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { otherUserId } = req.body;
    
    const conversation = await chatService.getOrCreatePrivateConversation(userId, otherUserId);
    
    res.json({
      status: 'success',
      data: { conversation },
    });
  });

  // Create a group conversation
  createGroup = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { name, participants, avatar } = req.body;
    
    const conversation = await chatService.createGroupConversation(
      userId,
      name,
      participants,
      avatar
    );
    
    res.status(201).json({
      status: 'success',
      data: { conversation },
    });
  });

  // Update group details
  updateGroup = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    const updates = req.body;
    
    const conversation = await chatService.updateGroup(conversationId, userId, updates);
    
    res.json({
      status: 'success',
      data: { conversation },
    });
  });

  // Add member to group
  addMember = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    const { memberId } = req.body;
    
    const conversation = await chatService.addMemberToGroup(conversationId, userId, memberId);
    
    res.json({
      status: 'success',
      data: { conversation },
    });
  });

  // Remove member from group
  removeMember = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { conversationId, memberId } = req.params;
    
    const conversation = await chatService.removeMemberFromGroup(
      conversationId,
      userId,
      memberId
    );
    
    res.json({
      status: 'success',
      data: { conversation },
    });
  });

  // Get conversation by ID
  getConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    
    const conversation = await chatService.getConversationById(conversationId, userId);
    
    res.json({
      status: 'success',
      data: { conversation },
    });
  });

  // Delete conversation
  deleteConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    
    const result = await chatService.deleteConversation(conversationId, userId);
    
    res.json({
      status: 'success',
      data: result,
    });
  });
}

export const chatController = new ChatController();
