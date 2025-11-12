import { Conversation, Message } from '../../database';
import { AppError } from '../../middlewares/errorHandler';
import mongoose from 'mongoose';
import { socketService } from '../../sockets';

export class ChatService {
  // Get all conversations for a user
  async getUserConversations(userId: string) {
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'username email avatarUrl status lastActive')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 })
      .lean();

    return conversations;
  }

  // Get or create private conversation
  async getOrCreatePrivateConversation(userId: string, otherUserId: string) {
    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      type: 'private',
      participants: { $all: [userId, otherUserId], $size: 2 },
    })
      .populate('participants', 'username email avatarUrl status lastActive')
      .lean();

    if (!conversation) {
      // Create new conversation
      const newConversation = await Conversation.create({
        type: 'private',
        participants: [userId, otherUserId],
        createdBy: userId,
      });

      conversation = await Conversation.findById(newConversation._id)
        .populate('participants', 'username email avatarUrl status lastActive')
        .lean();
    }

    return conversation;
  }

  // Create group conversation
  async createGroupConversation(
    userId: string,
    name: string,
    participantIds: string[],
    avatar?: string
  ) {
    // Validate participants
    if (participantIds.length < 1) {
      throw new AppError(400, 'At least 2 participants required for group');
    }

    // Include creator in participants
    const allParticipants = Array.from(new Set([userId, ...participantIds]));

    const conversation = await Conversation.create({
      type: 'group',
      groupName: name,
      groupAvatar: avatar,
      participants: allParticipants,
      admins: [userId],
      createdBy: userId,
    });

    const populated = await Conversation.findById(conversation._id)
      .populate('participants', 'username email avatarUrl status lastActive')
      .lean();

    return populated;
  }

  // Update group conversation
  async updateGroup(conversationId: string, userId: string, updates: any) {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new AppError(404, 'Conversation not found');
    }

    if (conversation.type !== 'group') {
      throw new AppError(400, 'Can only update group conversations');
    }

    // Check if user is admin
    if (!conversation.admins.includes(new mongoose.Types.ObjectId(userId))) {
      throw new AppError(403, 'Only admins can update group');
    }

    // Update allowed fields
    if (updates.groupName) conversation.groupName = updates.groupName;
    if (updates.groupAvatar) conversation.groupAvatar = updates.groupAvatar;

    await conversation.save();

    const updated = await Conversation.findById(conversationId)
      .populate('participants', 'username email avatarUrl status lastActive')
      .lean();

    // Notify group members
    socketService.emitToConversation(conversationId, 'group_updated', updated);

    return updated;
  }

  // Add member to group
  async addMemberToGroup(conversationId: string, userId: string, newMemberId: string) {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new AppError(404, 'Conversation not found');
    }

    if (conversation.type !== 'group') {
      throw new AppError(400, 'Can only add members to group conversations');
    }

    // Check if user is admin
    if (!conversation.admins.includes(new mongoose.Types.ObjectId(userId))) {
      throw new AppError(403, 'Only admins can add members');
    }

    // Check if member already exists
    if (conversation.participants.includes(new mongoose.Types.ObjectId(newMemberId))) {
      throw new AppError(400, 'User is already a member');
    }

    conversation.participants.push(new mongoose.Types.ObjectId(newMemberId));
    await conversation.save();

    const updated = await Conversation.findById(conversationId)
      .populate('participants', 'username email avatarUrl status lastActive')
      .lean();

    // Notify group members
    socketService.emitToConversation(conversationId, 'member_added', {
      conversation: updated,
      newMemberId,
    });

    return updated;
  }

  // Remove member from group
  async removeMemberFromGroup(
    conversationId: string,
    userId: string,
    memberIdToRemove: string
  ) {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new AppError(404, 'Conversation not found');
    }

    if (conversation.type !== 'group') {
      throw new AppError(400, 'Can only remove members from group conversations');
    }

    // Check if user is admin
    if (!conversation.admins.includes(new mongoose.Types.ObjectId(userId))) {
      throw new AppError(403, 'Only admins can remove members');
    }

    conversation.participants = conversation.participants.filter(
      (id) => id.toString() !== memberIdToRemove
    );

    await conversation.save();

    const updated = await Conversation.findById(conversationId)
      .populate('participants', 'username email avatarUrl status lastActive')
      .lean();

    // Notify group members
    socketService.emitToConversation(conversationId, 'member_removed', {
      conversation: updated,
      removedMemberId: memberIdToRemove,
    });

    return updated;
  }

  // Get conversation by ID
  async getConversationById(conversationId: string, userId: string) {
    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'username email avatarUrl status lastActive')
      .lean();

    if (!conversation) {
      throw new AppError(404, 'Conversation not found');
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      (p: any) => p._id.toString() === userId
    );

    if (!isParticipant) {
      throw new AppError(403, 'Access denied');
    }

    return conversation;
  }

  // Delete conversation
  async deleteConversation(conversationId: string, userId: string) {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new AppError(404, 'Conversation not found');
    }

    // For groups, only admins can delete
    if (conversation.type === 'group') {
      if (!conversation.admins.includes(new mongoose.Types.ObjectId(userId))) {
        throw new AppError(403, 'Only admins can delete group');
      }
    }

    await Conversation.findByIdAndDelete(conversationId);
    await Message.deleteMany({ conversationId });

    socketService.emitToConversation(conversationId, 'conversation_deleted', {
      conversationId,
    });

    return { message: 'Conversation deleted successfully' };
  }
}

export const chatService = new ChatService();
