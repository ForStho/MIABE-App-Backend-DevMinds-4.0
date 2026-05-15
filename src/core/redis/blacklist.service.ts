import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { REDIS_BLACKLIST_PREFIX } from './redis.constants';

@Injectable()
export class BlacklistService {
  constructor(private readonly redisService: RedisService) {}

  private buildKey(token: string): string {
    return `${REDIS_BLACKLIST_PREFIX}${token}`;
  }

  /**
   * Ajoute un token à la blacklist avec une durée de vie.
   * @param token Le token (ou son identifiant unique)
   * @param ttlSeconds Durée de vie (généralement le temps restant avant expiration du token)
   */
  async add(token: string, ttlSeconds: number): Promise<void> {
    const key = this.buildKey(token);
    await this.redisService.set(key, '1', ttlSeconds);
  }

  /**
   * Vérifie si un token est blacklisté.
   */
  async has(token: string): Promise<boolean> {
    const key = this.buildKey(token);
    const value = await this.redisService.get(key);
    return value !== null;
  }

  /**
   * Supprime un token de la blacklist (utile en cas de rotation forcée).
   */
  async remove(token: string): Promise<void> {
    const key = this.buildKey(token);
    await this.redisService.del(key);
  }
}
