import { createClient } from 'redis';
import { config } from '../config';

export type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;

export const connectRedis = async (): Promise<RedisClient> => {
  if (redisClient) {
    return redisClient;
  }

  redisClient = createClient({
    socket: {
      host: config.redis.host,
      port: config.redis.port,
    },
    password: config.redis.password,
  });

  redisClient.on('error', (error) => {
    console.error('❌ Redis connection error:', error);
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  redisClient.on('disconnect', () => {
    console.warn('⚠️  Redis disconnected');
  });

  await redisClient.connect();

  return redisClient;
};

export const getRedisClient = (): RedisClient => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

// Presence tracking utilities
export class PresenceManager {
  private readonly ONLINE_KEY_PREFIX = 'user:online:';
  private readonly TYPING_KEY_PREFIX = 'conversation:typing:';
  private readonly ONLINE_TTL = 300; // 5 minutes
  private readonly TYPING_TTL = 5; // 5 seconds

  async setUserOnline(userId: string): Promise<void> {
    const client = getRedisClient();
    const key = `${this.ONLINE_KEY_PREFIX}${userId}`;
    await client.setEx(key, this.ONLINE_TTL, Date.now().toString());
  }

  async setUserOffline(userId: string): Promise<void> {
    const client = getRedisClient();
    const key = `${this.ONLINE_KEY_PREFIX}${userId}`;
    await client.del(key);
  }

  async isUserOnline(userId: string): Promise<boolean> {
    const client = getRedisClient();
    const key = `${this.ONLINE_KEY_PREFIX}${userId}`;
    const result = await client.get(key);
    return result !== null;
  }

  async getOnlineUsers(userIds: string[]): Promise<string[]> {
    const client = getRedisClient();
    const onlineUsers: string[] = [];
    
    for (const userId of userIds) {
      const isOnline = await this.isUserOnline(userId);
      if (isOnline) {
        onlineUsers.push(userId);
      }
    }
    
    return onlineUsers;
  }

  async setUserTyping(conversationId: string, userId: string): Promise<void> {
    const client = getRedisClient();
    const key = `${this.TYPING_KEY_PREFIX}${conversationId}`;
    await client.setEx(`${key}:${userId}`, this.TYPING_TTL, '1');
  }

  async removeUserTyping(conversationId: string, userId: string): Promise<void> {
    const client = getRedisClient();
    const key = `${this.TYPING_KEY_PREFIX}${conversationId}:${userId}`;
    await client.del(key);
  }

  async getTypingUsers(conversationId: string): Promise<string[]> {
    const client = getRedisClient();
    const pattern = `${this.TYPING_KEY_PREFIX}${conversationId}:*`;
    const keys = await client.keys(pattern);
    
    return keys.map(key => {
      const parts = key.split(':');
      return parts[parts.length - 1];
    });
  }
}

// Cache utilities
export class CacheManager {
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const client = getRedisClient();
    const serialized = JSON.stringify(value);
    
    if (ttl) {
      await client.setEx(key, ttl, serialized);
    } else {
      await client.set(key, serialized);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const client = getRedisClient();
    const value = await client.get(key);
    
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async delete(key: string): Promise<void> {
    const client = getRedisClient();
    await client.del(key);
  }

  async deletePattern(pattern: string): Promise<void> {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    
    if (keys.length > 0) {
      await client.del(keys);
    }
  }
}

export const presenceManager = new PresenceManager();
export const cacheManager = new CacheManager();
