import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisService } from './redis.service';
import Redis from 'ioredis';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        const redis = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD || undefined,
          db: parseInt(process.env.REDIS_DB || '0'),
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
        });

        return {
          store: {
            get: async (key: string) => {
              const value = await redis.get(key);
              return value ? JSON.parse(value) : null;
            },
            set: async (key: string, value: any, ttl?: number) => {
              const serialized = JSON.stringify(value);
              if (ttl) {
                await redis.setex(key, Math.floor(ttl / 1000), serialized);
              } else {
                await redis.set(key, serialized);
              }
            },
            del: async (key: string) => {
              await redis.del(key);
            },
            reset: async () => {
              await redis.flushdb();
            },
            keys: async (pattern: string) => {
              return redis.keys(pattern);
            },
          },
          ttl: 3600, // Default TTL: 1 hour in seconds
        };
      },
    }),
  ],
  providers: [RedisService],
  exports: [CacheModule, RedisService],
})
export class RedisModule {}
