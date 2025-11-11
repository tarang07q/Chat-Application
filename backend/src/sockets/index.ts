import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import { getRedisClient } from '../utils/redis';
import { config } from '../config';
import jwt from 'jsonwebtoken';
import { presenceManager } from '../utils/redis';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export class SocketService {
  private io: SocketIOServer | null = null;

  initialize(httpServer: HTTPServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: config.frontendUrl,
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupRedisAdapter();
    this.setupMiddleware();
    this.setupEventHandlers();

    return this.io;
  }

  private async setupRedisAdapter(): Promise<void> {
    if (!this.io) return;

    const pubClient = getRedisClient();
    const subClient = pubClient.duplicate();
    
    await subClient.connect();

    this.io.adapter(createAdapter(pubClient, subClient));
    
    console.log('✅ Socket.io Redis adapter configured');
  }

  private setupMiddleware(): void {
    if (!this.io) return;

    // Authentication middleware
    this.io.use((socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

        if (!token) {
          return next(new Error('Authentication error: Token required'));
        }

        const decoded = jwt.verify(token, config.jwt.secret) as {
          id: string;
          username: string;
        };

        socket.userId = decoded.id;
        socket.username = decoded.username;
        
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', async (socket: AuthenticatedSocket) => {
      const userId = socket.userId!;
      const username = socket.username!;

      console.log(`✅ User connected: ${username} (${userId})`);

      // Set user as online
      await presenceManager.setUserOnline(userId);

      // Notify about online status
      socket.broadcast.emit('user_status_change', {
        userId,
        status: 'online',
      });

      // Join user's personal room for direct messages
      socket.join(`user:${userId}`);

      // Handle joining conversation rooms
      socket.on('join_room', (data: { conversationId: string }) => {
        const { conversationId } = data;
        socket.join(`conversation:${conversationId}`);
        console.log(`User ${username} joined conversation ${conversationId}`);
      });

      // Handle leaving conversation rooms
      socket.on('leave_room', (data: { conversationId: string }) => {
        const { conversationId } = data;
        socket.leave(`conversation:${conversationId}`);
      });

      // Handle typing indicator
      socket.on('typing', async (data: { conversationId: string }) => {
        const { conversationId } = data;
        await presenceManager.setUserTyping(conversationId, userId);
        
        socket.to(`conversation:${conversationId}`).emit('typing', {
          conversationId,
          userId,
          username,
        });
      });

      // Handle stop typing
      socket.on('stop_typing', async (data: { conversationId: string }) => {
        const { conversationId } = data;
        await presenceManager.removeUserTyping(conversationId, userId);
        
        socket.to(`conversation:${conversationId}`).emit('stop_typing', {
          conversationId,
          userId,
        });
      });

      // Handle message read
      socket.on('message_read', (data: { messageId: string; conversationId: string }) => {
        socket.to(`conversation:${data.conversationId}`).emit('message_read', {
          messageId: data.messageId,
          userId,
        });
      });

      // Handle disconnect
      socket.on('disconnect', async () => {
        console.log(`❌ User disconnected: ${username} (${userId})`);
        
        // Set user as offline
        await presenceManager.setUserOffline(userId);
        
        // Notify about offline status
        socket.broadcast.emit('user_status_change', {
          userId,
          status: 'offline',
        });
      });
    });
  }

  getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error('Socket.io not initialized. Call initialize() first.');
    }
    return this.io;
  }

  // Emit to specific conversation
  emitToConversation(conversationId: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(`conversation:${conversationId}`).emit(event, data);
  }

  // Emit to specific user
  emitToUser(userId: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Emit to all connected users
  emitToAll(event: string, data: any): void {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  // Get online users in a conversation
  async getOnlineUsersInConversation(conversationId: string): Promise<string[]> {
    if (!this.io) return [];
    
    const sockets = await this.io.in(`conversation:${conversationId}`).fetchSockets();
    return sockets.map(s => (s as AuthenticatedSocket).userId!).filter(Boolean);
  }
}

export const socketService = new SocketService();
