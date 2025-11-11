import { create } from 'zustand';
import { Message, Conversation } from '@/types';
import { socketService } from '@/services/socket';

interface TypingUser {
  userId: string;
  username: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>; // conversationId -> messages
  typingUsers: Record<string, TypingUser[]>; // conversationId -> users
  onlineUsers: Set<string>;
  unreadCounts: Record<string, number>;

  // Actions
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  setActiveConversation: (conversationId: string | null) => void;
  
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  
  setTypingUsers: (conversationId: string, users: TypingUser[]) => void;
  addTypingUser: (conversationId: string, user: TypingUser) => void;
  removeTypingUser: (conversationId: string, userId: string) => void;
  
  setOnlineUsers: (users: string[]) => void;
  updateUserStatus: (userId: string, isOnline: boolean) => void;
  
  incrementUnread: (conversationId: string) => void;
  resetUnread: (conversationId: string) => void;
  
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  typingUsers: {},
  onlineUsers: new Set(),
  unreadCounts: {},

  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),

  updateConversation: (conversationId, updates) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv._id === conversationId ? { ...conv, ...updates } : conv
      ),
    })),

  setActiveConversation: (conversationId) => {
    const current = get().activeConversationId;
    
    // Leave previous room
    if (current) {
      socketService.leaveRoom(current);
    }
    
    // Join new room
    if (conversationId) {
      socketService.joinRoom(conversationId);
      get().resetUnread(conversationId);
    }
    
    set({ activeConversationId: conversationId });
  },

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
    })),

  addMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), message],
      },
    })),

  updateMessage: (conversationId, messageId, updates) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map((msg) =>
          msg._id === messageId ? { ...msg, ...updates } : msg
        ),
      },
    })),

  deleteMessage: (conversationId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).filter(
          (msg) => msg._id !== messageId
        ),
      },
    })),

  setTypingUsers: (conversationId, users) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: users,
      },
    })),

  addTypingUser: (conversationId, user) =>
    set((state) => {
      const current = state.typingUsers[conversationId] || [];
      if (current.some((u) => u.userId === user.userId)) {
        return state;
      }
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: [...current, user],
        },
      };
    }),

  removeTypingUser: (conversationId, userId) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: (state.typingUsers[conversationId] || []).filter(
          (user) => user.userId !== userId
        ),
      },
    })),

  setOnlineUsers: (users) => set({ onlineUsers: new Set(users) }),

  updateUserStatus: (userId, isOnline) =>
    set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      if (isOnline) {
        newOnlineUsers.add(userId);
      } else {
        newOnlineUsers.delete(userId);
      }
      return { onlineUsers: newOnlineUsers };
    }),

  incrementUnread: (conversationId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [conversationId]: (state.unreadCounts[conversationId] || 0) + 1,
      },
    })),

  resetUnread: (conversationId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [conversationId]: 0,
      },
    })),

  clearChat: () =>
    set({
      conversations: [],
      activeConversationId: null,
      messages: {},
      typingUsers: {},
      onlineUsers: new Set(),
      unreadCounts: {},
    }),
}));
