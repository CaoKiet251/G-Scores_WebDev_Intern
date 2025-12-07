import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

/**
 * RedisService - Service để quản lý cache với Redis
 * Sử dụng OOP principles: Service pattern, Dependency Injection
 */
@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Lấy dữ liệu từ cache
   * @param key - Key của cache
   * @returns Dữ liệu từ cache hoặc null
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(key);
      return value ?? null;
    } catch (error) {
      console.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  /**
   * Lưu dữ liệu vào cache
   * @param key - Key của cache
   * @param value - Giá trị cần lưu
   * @param ttl - Thời gian sống (seconds), mặc định 3600 (1 giờ)
   */
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl * 1000); // Convert to milliseconds
    } catch (error) {
      console.error(`Error setting cache key ${key}:`, error);
    }
  }

  /**
   * Xóa dữ liệu khỏi cache
   * @param key - Key của cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      console.error(`Error deleting cache key ${key}:`, error);
    }
  }

  /**
   * Xóa tất cả cache có pattern
   * @param pattern - Pattern để tìm keys (ví dụ: 'statistics:*')
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      // Lấy store từ cache manager
      const store = (this.cacheManager as any).store;
      if (store && typeof store.keys === 'function') {
        const keys = await store.keys(pattern);
        if (keys && keys.length > 0) {
          await Promise.all(keys.map((key: string) => this.delete(key)));
        }
      }
    } catch (error) {
      console.error(`Error deleting cache pattern ${pattern}:`, error);
    }
  }

  /**
   * Xóa toàn bộ cache
   */
  async reset(): Promise<void> {
    try {
      const store = (this.cacheManager as any).store;
      if (store && typeof store.reset === 'function') {
        await store.reset();
      }
    } catch (error) {
      console.error('Error resetting cache:', error);
    }
  }
}
