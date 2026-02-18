import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private isConnected = false;

  async onModuleInit() {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('❌ [Redis] Max reconnection attempts reached');
              return new Error('Max reconnection attempts reached');
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });

      this.client.on('error', (err) => {
        console.error('❌ [Redis] Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('🔄 [Redis] Connecting...');
      });

      this.client.on('ready', () => {
        console.log('✅ [Redis] Connected and ready');
        this.isConnected = true;
      });

      this.client.on('reconnecting', () => {
        console.log('🔄 [Redis] Reconnecting...');
      });

      await this.client.connect();
    } catch (error) {
      console.error('❌ [Redis] Connection failed:', error);
      console.warn('⚠️ [Redis] Continuing without Redis (fallback mode)');
      this.isConnected = false;
    }
  }

  async onModuleDestroy() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      console.log('🔌 [Redis] Disconnected');
    }
  }

  private async ensureConnected(): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Set a key-value pair in Redis
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    if (!(await this.ensureConnected())) {
      return false;
    }

    try {
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      console.error(`❌ [Redis] Error setting key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get a value from Redis
   */
  async get(key: string): Promise<string | null> {
    if (!(await this.ensureConnected())) {
      return null;
    }

    try {
      return await this.client.get(key);
    } catch (error) {
      console.error(`❌ [Redis] Error getting key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete a key from Redis
   */
  async del(key: string): Promise<boolean> {
    if (!(await this.ensureConnected())) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(`❌ [Redis] Error deleting key ${key}:`, error);
      return false;
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!(await this.ensureConnected())) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`❌ [Redis] Error checking key ${key}:`, error);
      return false;
    }
  }

  /**
   * Set expiration time for a key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    if (!(await this.ensureConnected())) {
      return false;
    }

    try {
      await this.client.expire(key, seconds);
      return true;
    } catch (error) {
      console.error(`❌ [Redis] Error setting expiration for key ${key}:`, error);
      return false;
    }
  }
}


