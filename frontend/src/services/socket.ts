import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export interface SocketEvents {
  // Client -> Server
  join_room: (data: { conversationId: string }) => void;
  leave_room: (data: { conversationId: string }) => void;
  typing: (data: { conversationId: string }) => void;
  stop_typing: (data: { conversationId: string }) => void;
  send_message: (data: any) => void;
  message_read: (data: { messageId: string; conversationId: string }) => void;

  // Server -> Client
  receive_message: (callback: (data: any) => void) => void;
  message_delivered: (callback: (data: any) => void) => void;
  user_status_change: (callback: (data: { userId: string; status: string }) => void) => void;
  online_users: (callback: (data: { users: string[] }) => void) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventHandlers();
    return this.socket;
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Emit events
  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  // Listen to events
  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Join conversation room
  joinRoom(conversationId: string): void {
    this.emit('join_room', { conversationId });
  }

  // Leave conversation room
  leaveRoom(conversationId: string): void {
    this.emit('leave_room', { conversationId });
  }

  // Typing indicators
  startTyping(conversationId: string): void {
    this.emit('typing', { conversationId });
  }

  stopTyping(conversationId: string): void {
    this.emit('stop_typing', { conversationId });
  }

  // Mark message as read
  markMessageAsRead(messageId: string, conversationId: string): void {
    this.emit('message_read', { messageId, conversationId });
  }
}

export const socketService = new SocketService();
