export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  status: 'online' | 'offline';
  lastActive: string;
}

export interface Conversation {
  _id: string;
  type: 'private' | 'group';
  participants: User[];
  groupName?: string;
  groupAvatar?: string;
  admins: string[];
  lastMessage?: Message;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
}

export interface Attachment {
  url: string;
  fileType: string;
  fileName: string;
  fileSize: number;
}

export interface Reaction {
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  sender?: User;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'voice' | 'video';
  attachments: Attachment[];
  replyTo?: string;
  replyToMessage?: Message;
  reactions: Reaction[];
  seenBy: string[];
  deliveredTo: string[];
  isEdited: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: 'message' | 'mention' | 'group_invite' | 'file_received' | 'reaction';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  conversationId?: string;
  senderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface TypingUser {
  userId: string;
  username: string;
  conversationId: string;
}

export interface OnlineStatus {
  userId: string;
  status: 'online' | 'offline';
}
