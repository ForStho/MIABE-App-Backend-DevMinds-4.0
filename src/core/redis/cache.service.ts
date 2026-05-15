import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import { REDIS_CACHE_PREFIX } from './redis.constants';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly prefix: string;
  private readonly defaultTtl: number;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.prefix = this.configService.get('cache.prefix') || REDIS_CACHE_PREFIX;
    this.defaultTtl = this.configService.get('cache.ttl') || 3600; // 1h
  }

  private buildKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Récupère une valeur du cache.
   * @returns La valeur désérialisée ou null si absente
   */
  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.buildKey(key);
    const data = await this.redisService.get(fullKey);
    if (!data) return null;

    try {
      return JSON.parse(data) as T;
    } catch (err) {
      this.logger.warn(
        `Failed to parse cached value for key ${key}: ${err.message}`,
      );
      await this.redisService.del(fullKey); // Supprime l'entrée corrompue
      return null;
    }
  }

  /**
   * Stocke une valeur dans le cache.
   * @param ttl Durée de vie en secondes (utilise defaultTtl si non fourni)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const fullKey = this.buildKey(key);
    const serialized = JSON.stringify(value);
    const ttlSeconds = ttl ?? this.defaultTtl;
    await this.redisService.set(fullKey, serialized, ttlSeconds);
  }

  /**
   * Supprime une clé.
   */
  async del(key: string): Promise<void> {
    const fullKey = this.buildKey(key);
    await this.redisService.del(fullKey);
  }

  /**
   * Invalide toutes les clés correspondant à un pattern.
   * Attention : peut être coûteux en production.
   */
  async delByPattern(pattern: string): Promise<void> {
    const client = this.redisService.getClient();
    const keys = await client.keys(`${this.prefix}${pattern}`);
    if (keys.length > 0) {
      await client.del(...keys);
      this.logger.log(
        `Invalidated ${keys.length} keys matching pattern ${pattern}`,
      );
    }
  }

  /**
   * Récupère ou calcule une valeur (pattern cache-aside).
   * @param factory Fonction asynchrone pour générer la valeur si absente
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }
}
