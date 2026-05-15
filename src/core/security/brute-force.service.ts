import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { BRUTE_FORCE_PREFIX } from './security.constants';

@Injectable()
export class BruteForceService {
  private readonly maxAttempts: number;
  private readonly window: number;
  private readonly blockDuration: number;

  constructor(
    private redisService: RedisService,
    private configService: ConfigService,
  ) {
    this.maxAttempts = this.configService.get(
      'security.bruteForce.maxAttempts',
      5,
    );
    this.window = this.configService.get('security.bruteForce.window', 300); // 5 min
    this.blockDuration = this.configService.get(
      'security.bruteForce.blockDuration',
      900,
    ); // 15 min
  }

  private buildKey(identifier: string): string {
    return `${BRUTE_FORCE_PREFIX}${identifier}`;
  }

  /**
   * Incrémente le compteur de tentatives pour un identifiant (email, IP).
   * Retourne true si le seuil est dépassé.
   */
  async incrementAttempt(identifier: string): Promise<boolean> {
    const key = this.buildKey(identifier);
    const attempts = await this.redisService.incr(key);
    if (attempts === 1) {
      await this.redisService.expire(key, this.window);
    }
    if (attempts >= this.maxAttempts) {
      // Bloquer pour blockDuration
      await this.redisService.expire(key, this.blockDuration);
      return true; // bloqué
    }
    return false;
  }

  /**
   * Vérifie si l'identifiant est actuellement bloqué.
   */
  async isBlocked(identifier: string): Promise<boolean> {
    const key = this.buildKey(identifier);
    const ttl = await this.redisService.ttl(key);
    return ttl > 0; // si la clé existe et a un TTL > 0, c'est qu'elle est encore en période de blocage
  }

  /**
   * Réinitialise le compteur pour un identifiant (ex: après une connexion réussie).
   */
  async reset(identifier: string): Promise<void> {
    const key = this.buildKey(identifier);
    await this.redisService.del(key);
  }
}
