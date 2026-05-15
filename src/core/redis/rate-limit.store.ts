import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { REDIS_RATE_LIMIT_PREFIX } from './redis.constants';

@Injectable()
export class RateLimitStore {
  constructor(private readonly redisService: RedisService) {}

  private buildKey(key: string): string {
    return `${REDIS_RATE_LIMIT_PREFIX}${key}`;
  }

  /**
   * Incrémente le compteur et définit l'expiration si c'est la première fois.
   * Utilise une transaction Lua pour garantir l'atomicité.
   */
  async increment(key: string, ttlSeconds: number): Promise<number> {
    const fullKey = this.buildKey(key);
    // Script Lua atomique : incrémente et définit l'expiration si clé nouvelle
    const script = `
      local current = redis.call('INCR', KEYS[1])
      if current == 1 then
        redis.call('EXPIRE', KEYS[1], ARGV[1])
      end
      return current
    `;
    const result = await this.redisService.eval(
      script,
      [fullKey],
      [ttlSeconds],
    );
    return result as number;
  }

  /**
   * Réinitialise le compteur.
   */
  async reset(key: string): Promise<void> {
    const fullKey = this.buildKey(key);
    await this.redisService.del(fullKey);
  }

  /**
   * Récupère la valeur courante sans incrémenter.
   */
  async get(key: string): Promise<number> {
    const fullKey = this.buildKey(key);
    const val = await this.redisService.get(fullKey);
    return val ? parseInt(val, 10) : 0;
  }
}
