// src/common/guards/rate-limit.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitStore } from '../../core/redis/rate-limit.store';
import { Request } from 'express';

interface ThrottleOptions {
  limit: number;
  ttl: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(
    private readonly rateLimitStore: RateLimitStore,
    private readonly reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: any; geoLocation?: any }>();
    const response = context.switchToHttp().getResponse();

    // Récupérer les options via décorateur @Throttle()
    const throttleOptions = this.reflector.getAllAndOverride<ThrottleOptions>('throttle', [
      context.getHandler(),
      context.getClass(),
    ]);

    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler()) || false;

    // === Configuration des limites ===
    let limit = 10;
    let ttl = 60;

    if (throttleOptions) {
      limit = throttleOptions.limit;
      ttl = throttleOptions.ttl;
    }
    else if (isPublic) {
      // Routes publiques (catalogue) → limites généreuses
      limit = 100;   // 150 requêtes par minute pour anonymous
      ttl = 60;
    }
    else {
      // Routes authentifiées → encore plus permissif
      limit = 100;
      ttl = 60;
    }

    try {
      const key = this.buildKey(request);
      const current = await this.rateLimitStore.increment(key, ttl);

      // Headers standards pour le client
      response.header('X-RateLimit-Limit', limit.toString());
      response.header('X-RateLimit-Remaining', Math.max(0, limit - current).toString());
      response.header('X-RateLimit-Reset', Math.ceil(Date.now() / 1000) + ttl);

      if (current > limit) {
        this.logger.warn(`Rate limit exceeded for key: ${key} | Current: ${current}/${limit}`);
        throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`RateLimitGuard error: ${error.message}`);
      return true; // Fail open en cas d'erreur Redis
    }
  }

  private buildKey(request: any): string {
    const userId = request.user?._id || request.user?.id;

    if (userId) {
      return `rate:user:${userId}`;
    }

    // Pour anonymous : meilleure empreinte
    const ip = this.extractIp(request);
    const uaHash = this.hashUserAgent(request.headers['user-agent'] || 'unknown');

    return `rate:anon:${ip}:${uaHash}`;
  }

  private extractIp(request: any): string {
    return (
      request.ip ||
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      request.connection?.remoteAddress ||
      'unknown'
    );
  }

  private hashUserAgent(ua: string): string {
    let hash = 0;
    for (let i = 0; i < ua.length; i++) {
      hash = (hash << 5) - hash + ua.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36).slice(0, 12);
  }
}