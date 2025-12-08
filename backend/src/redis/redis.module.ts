import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisService } from './redis.service';
import Redis from 'ioredis';

// Constants
const DEFAULT_TTL = 3600; // 1 hour in seconds
const MAX_RETRY_ATTEMPTS = 20;
const RETRY_DELAY_MULTIPLIER = 50;
const MAX_RETRY_DELAY = 2000;
const CONNECT_TIMEOUT = 5000;
const COMMAND_TIMEOUT = 3000;
const KEEP_ALIVE = 30000;

/**
 * RedisModule - Module quản lý Redis cache
 * 
 * Features:
 * - Graceful error handling: Ứng dụng vẫn chạy được khi Redis không available
 * - Auto reconnect với exponential backoff
 * - Health check mechanism
 * - Connection timeout
 */
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        const redis = createRedisClient();
        const store = createRedisStore(redis);

        return { store, ttl: DEFAULT_TTL };
      },
    }),
  ],
  providers: [RedisService],
  exports: [CacheModule, RedisService],
})
export class RedisModule {}

/**
 * Tạo Redis client với cấu hình tối ưu
 */
function createRedisClient(): Redis {
  const config = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
    connectTimeout: CONNECT_TIMEOUT,
    commandTimeout: COMMAND_TIMEOUT,
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
    enableReadyCheck: true,
    lazyConnect: false,
    keepAlive: KEEP_ALIVE,
    retryStrategy: (times: number): number | null => {
      if (times > MAX_RETRY_ATTEMPTS) {
        return null;
      }
      return Math.min(times * RETRY_DELAY_MULTIPLIER, MAX_RETRY_DELAY);
    },
  };

  const redis = new Redis(config);
  setupRedisEvents(redis);

  return redis;
}

/**
 * Thiết lập event handlers cho Redis client
 */
function setupRedisEvents(redis: Redis): void {
  redis.on('error', () => {});
  redis.on('ready', () => {});
  redis.on('close', () => {});
}

/**
 * Tạo Redis store với các methods cần thiết
 */
function createRedisStore(redis: Redis) {
  const isAvailable = (): boolean => {
    return redis.status === 'ready';
  };

  return {
    get: async (key: string) => {
      if (!isAvailable()) return null;
      
      try {
        const value = await redis.get(key);
        return value ? JSON.parse(value) : null;
      } catch {
        return null;
      }
    },

    set: async (key: string, value: any, ttl?: number) => {
      if (!isAvailable()) return;
      
      try {
        const serialized = JSON.stringify(value);
        const ttlSeconds = ttl ? Math.floor(ttl / 1000) : undefined;
        
        if (ttlSeconds) {
          await redis.setex(key, ttlSeconds, serialized);
        } else {
          await redis.set(key, serialized);
        }
      } catch {
        // Ignore errors
      }
    },

    del: async (key: string) => {
      if (!isAvailable()) return;
      
      try {
        await redis.del(key);
      } catch {
        // Ignore errors
      }
    },

    reset: async () => {
      if (!isAvailable()) return;
      
      try {
        await redis.flushdb();
      } catch {
        // Ignore errors
      }
    },

    keys: async (pattern: string) => {
      if (!isAvailable()) return [];
      
      try {
        return await redis.keys(pattern);
      } catch {
        return [];
      }
    },
  };
}
