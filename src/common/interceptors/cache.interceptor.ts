import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../../core/redis/cache.service';
import { Reflector } from '@nestjs/core';

/**
 * Intercepteur de mise en cache des réponses GET.
 * Utilise Redis pour stocker les réponses avec une durée de vie configurable.
 * Peut être activé via un décorateur @Cacheable(ttl).
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private cacheService: CacheService,
    private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    // Seulement pour les requêtes GET
    if (request.method !== 'GET') {
      return next.handle();
    }

    const cacheKey = this.getCacheKey(context);
    const ttl = this.getCacheTTL(context);

    // Vérifier le cache
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return of(cached);
    }

    // Sinon, exécuter la requête et mettre en cache
    return next.handle().pipe(
      tap((response) => {
        this.cacheService.set(cacheKey, response, ttl);
      }),
    );
  }

  private getCacheKey(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    // Générer une clé unique basée sur l'URL, les query params, et l'utilisateur (si authentifié)
    const userId = request.user?.id || 'anonymous';
    return `cache:${userId}:${request.method}:${request.url}`;
  }

  private getCacheTTL(context: ExecutionContext): number {
    // Utiliser un décorateur @Cacheable(ttl) pour définir la durée, sinon valeur par défaut
    const cacheable = this.reflector.get<{ ttl: number }>(
      'cacheable',
      context.getHandler(),
    );
    return cacheable?.ttl || 60; // 60 secondes par défaut
  }
}
