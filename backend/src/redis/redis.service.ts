import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

// Constants
const HEALTH_CHECK_DELAY = 2000;
const DEFAULT_TTL = 3600;
const BATCH_SIZE = 100;
const HEALTH_CHECK_KEY = '__health_check__';

/**
 * RedisService - Service để quản lý cache với Redis
 * 
 * Features:
 * - Graceful error handling: Không throw error khi Redis không available
 * - Health check methods
 * - Automatic fallback khi Redis không available
 */
@Injectable()
export class RedisService implements OnModuleInit {
  private isHealthy = false;

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async onModuleInit(): Promise<void> {
    setTimeout(() => this.checkHealth(), HEALTH_CHECK_DELAY);
  }

  /**
   * Kiểm tra health của Redis connection
   */
  async checkHealth(): Promise<boolean> {
    try {
      const store = (this.cacheManager as any).store;
      if (store?.get) {
        await this.cacheManager.get(HEALTH_CHECK_KEY);
        this.isHealthy = true;
        return true;
      }
    } catch {
      // Silent error handling
    }
    
    this.isHealthy = false;
    return false;
  }

  /**
   * Lấy trạng thái health hiện tại
   */
  getHealthStatus(): boolean {
    return this.isHealthy;
  }

  /**
   * Lấy dữ liệu từ cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(key);
      return value ?? null;
    } catch {
      this.isHealthy = false;
      return null;
    }
  }

  /**
   * Lưu dữ liệu vào cache
   */
  async set(key: string, value: any, ttl: number = DEFAULT_TTL): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl * 1000);
      this.isHealthy = true;
    } catch {
      this.isHealthy = false;
    }
  }

  /**
   * Xóa dữ liệu khỏi cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch {
      this.isHealthy = false;
    }
  }

  /**
   * Xóa tất cả cache có pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const store = (this.cacheManager as any).store;
      const keys = await store?.keys?.(pattern);
      
      if (!keys?.length) return;

      for (let i = 0; i < keys.length; i += BATCH_SIZE) {
        const batch = keys.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map((key: string) => this.delete(key)));
      }
    } catch {
      this.isHealthy = false;
    }
  }

  /**
   * Xóa toàn bộ cache
   */
  async reset(): Promise<void> {
    try {
      const store = (this.cacheManager as any).store;
      await store?.reset?.();
    } catch {
      this.isHealthy = false;
    }
  }}