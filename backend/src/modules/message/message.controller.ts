import { Response } from 'express';
import { messageService } from './message.service';
import { asyncHandler } from '../../middlewares/errorHandler';
import { AuthRequest } from '../../middlewares/auth';

class MessageController {
  // Get messages for a conversation
  getMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const result = await messageService.getMessages(conversationId, userId, page, limit);
    
    res.json({
      status: 'success',
      data: result,
    });
  });

  // Send a message
  sendMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { conversationId, content, messageType, attachments, replyTo } = req.body;
    
    const message = await messageService.sendMessage(
      conversationId,
      userId,
      content,
      messageType,
      attachments,
      replyTo
    );
    
    res.status(201).json({
      status: 'success',
      data: { message },
    });
  });

  // Edit a message
  editMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { messageId } = req.params;
    const { content } = req.body;
    
    const message = await messageService.editMessage(messageId, userId, content);
    
    res.json({
      status: 'success',
      data: { message },
    });
  });

  // Delete a message
  deleteMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { messageId } = req.params;
    
    const result = await messageService.deleteMessage(messageId, userId);
    
    res.json({
      status: 'success',
      data: result,
    });
  });

  // Add reaction to a message
  addReaction = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { messageId } = req.params;
    const { emoji } = req.body;
    
    const message = await messageService.addReaction(messageId, userId, emoji);
    
    res.json({
      status: 'success',
      data: { message },
    });
  });

  // Remove reaction from a message
  removeReaction = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { messageId } = req.params;
    const { emoji } = req.body;
    
    const message = await messageService.removeReaction(messageId, userId, emoji);
    
    res.json({
      status: 'success',
      data: { message },
    });
  });

  // Mark messages as read
  markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    const { messageIds } = req.body;
    
    const result = await messageService.markAsRead(conversationId, userId, messageIds);
    
    res.json({
      status: 'success',
      data: result,
    });
  });

  // Search messages
  searchMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { query, conversationId } = req.query;
    
    const messages = await messageService.searchMessages(
      userId,
      query as string,
      conversationId as string | undefined
    );
    
    res.json({
      status: 'success',
      data: { messages },
    });
  });
}

export const messageController = new MessageController();
