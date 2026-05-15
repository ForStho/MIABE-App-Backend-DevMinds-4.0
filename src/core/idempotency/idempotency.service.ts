import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class IdempotencyService {
  private readonly ttl: number;
  private readonly prefix: string;

  constructor(
    private redisService: RedisService,
    private configService: ConfigService,
  ) {
    this.ttl = this.configService.get('idempotency.ttl', 86400);
    this.prefix = this.configService.get('idempotency.prefix', 'idempotency:');
  }

  private buildKey(key: string, method: string): string {
    return `${this.prefix}${method}:${key}`;
  }

  async getCachedResponse(key: string, method?: string): Promise<any> {
    const fullKey = this.buildKey(key, method || 'POST');
    const data = await this.redisService.get(fullKey);
    return data ? JSON.parse(data) : null;
  }

  async cacheResponse(
    key: string,
    response: any,
    method: string,
  ): Promise<void> {
    const fullKey = this.buildKey(key, method);
    await this.redisService.set(fullKey, JSON.stringify(response), this.ttl);
  }

  async invalidateKey(key: string, method?: string): Promise<void> {
    const fullKey = this.buildKey(key, method || 'POST');
    await this.redisService.del(fullKey);
  }
}
