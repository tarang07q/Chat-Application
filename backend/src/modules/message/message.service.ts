import { Message, Conversation } from '../../database';
import { AppError } from '../../middlewares/errorHandler';
import { socketService } from '../../sockets';
import mongoose from 'mongoose';

export class MessageService {
  // Get messages for a conversation
  async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    // Verify user has access to conversation
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      throw new AppError(404, 'Conversation not found');
    }

    const isParticipant = conversation.participants.some(
      (id) => id.toString() === userId
    );

    if (!isParticipant) {
      throw new AppError(403, 'Access denied');
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({ 
      conversationId,
      isDeleted: false 
    })
      .populate('senderId', 'username email avatarUrl')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Message.countDocuments({ 
      conversationId,
      isDeleted: false 
    });

    return {
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Send a new message
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    messageType: 'text' | 'image' | 'file' | 'voice' | 'video' = 'text',
    attachments: any[] = [],
    replyTo?: string
  ) {
    // Verify conversation exists and user has access
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      throw new AppError(404, 'Conversation not found');
    }

    const isParticipant = conversation.participants.some(
      (id) => id.toString() === senderId
    );

    if (!isParticipant) {
      throw new AppError(403, 'Not a participant in this conversation');
    }

    // Create message
    const message = await Message.create({
      conversationId,
      senderId,
      content,
      messageType,
      attachments,
      replyTo: replyTo ? new mongoose.Types.ObjectId(replyTo) : undefined,
      deliveredTo: [senderId],
    });

    // Update conversation's last message
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Populate message before sending
    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'username email avatarUrl')
      .populate('replyTo')
      .lean();

    // Emit to all participants in real-time
    socketService.emitToConversation(conversationId, 'receive_message', {
      message: populatedMessage,
      conversationId,
    });

    return populatedMessage;
  }

  // Edit message
  async editMessage(messageId: string, userId: string, newContent: string) {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new AppError(404, 'Message not found');
    }

    if (message.senderId.toString() !== userId) {
      throw new AppError(403, 'Can only edit your own messages');
    }

    message.content = newContent;
    message.isEdited = true;
    await message.save();

    const updated = await Message.findById(messageId)
      .populate('senderId', 'username email avatarUrl')
      .lean();

    // Emit update to conversation
    socketService.emitToConversation(message.conversationId.toString(), 'message_updated', {
      message: updated,
    });

    return updated;
  }

  // Delete message
  async deleteMessage(messageId: string, userId: string) {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new AppError(404, 'Message not found');
    }

    if (message.senderId.toString() !== userId) {
      throw new AppError(403, 'Can only delete your own messages');
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = 'This message was deleted';
    await message.save();

    // Emit deletion to conversation
    socketService.emitToConversation(message.conversationId.toString(), 'message_deleted', {
      messageId,
      conversationId: message.conversationId,
    });

    return { message: 'Message deleted successfully' };
  }

  // Add reaction to message
  async addReaction(messageId: string, userId: string, emoji: string) {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new AppError(404, 'Message not found');
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      (r) => r.userId.toString() === userId && r.emoji === emoji
    );

    if (existingReaction) {
      throw new AppError(400, 'Already reacted with this emoji');
    }

    message.reactions.push({
      userId: new mongoose.Types.ObjectId(userId),
      emoji,
      createdAt: new Date(),
    });

    await message.save();

    const updated = await Message.findById(messageId)
      .populate('senderId', 'username email avatarUrl')
      .lean();

    // Emit reaction to conversation
    socketService.emitToConversation(message.conversationId.toString(), 'reaction_added', {
      messageId,
      userId,
      emoji,
      message: updated,
    });

    return updated;
  }

  // Remove reaction from message
  async removeReaction(messageId: string, userId: string, emoji: string) {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new AppError(404, 'Message not found');
    }

    message.reactions = message.reactions.filter(
      (r) => !(r.userId.toString() === userId && r.emoji === emoji)
    );

    await message.save();

    const updated = await Message.findById(messageId)
      .populate('senderId', 'username email avatarUrl')
      .lean();

    // Emit reaction removal to conversation
    socketService.emitToConversation(message.conversationId.toString(), 'reaction_removed', {
      messageId,
      userId,
      emoji,
      message: updated,
    });

    return updated;
  }

  // Mark messages as read
  async markAsRead(conversationId: string, userId: string, messageIds: string[]) {
    await Message.updateMany(
      {
        _id: { $in: messageIds },
        conversationId,
      },
      {
        $addToSet: { seenBy: userId },
      }
    );

    // Emit read status to conversation
    socketService.emitToConversation(conversationId, 'messages_read', {
      conversationId,
      userId,
      messageIds,
    });

    return { message: 'Messages marked as read' };
  }

  // Search messages
  async searchMessages(userId: string, query: string, conversationId?: string) {
    const searchQuery: any = {
      $text: { $search: query },
      isDeleted: false,
    };

    if (conversationId) {
      searchQuery.conversationId = conversationId;
    }

    const messages = await Message.find(searchQuery)
      .populate('senderId', 'username email avatarUrl')
      .populate('conversationId')
      .limit(50)
      .lean();

    // Filter by conversations user has access to
    const accessibleConversations = await Conversation.find({
      participants: userId,
    }).select('_id');

    const accessibleIds = new Set(accessibleConversations.map((c) => c._id.toString()));

    const filteredMessages = messages.filter((msg: any) =>
      accessibleIds.has(msg.conversationId._id.toString())
    );

    return filteredMessages;
  }
}

export const messageService = new MessageService();
