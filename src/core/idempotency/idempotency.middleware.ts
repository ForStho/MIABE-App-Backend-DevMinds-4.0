import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { IdempotencyService } from './idempotency.service';
import { IDEMPOTENCY_KEY_HEADER } from './idempotency.constants';

/**
 * Interface pour la réponse mise en cache par l'idempotence.
 * @property statusCode - Code HTTP de la réponse originale
 * @property body - Corps de la réponse (peut être de n'importe quel type)
 */
export interface CachedResponse {
  statusCode: number;
  body: unknown;
}

/**
 * Type pour la fonction send originale de Express Response
 * Cette fonction peut accepter différents types de body et retourne Response
 */
type SendFunction = (body?: unknown) => Response;

/**
 * Middleware de gestion de l'idempotence.
 * 
 * Ce middleware intercepte les requêtes avec un en-tête d'idempotence (ex: Idempotency-Key)
 * et met en cache les réponses pour éviter les doublons en cas de répétition de la requête.
 * 
 * Principes :
 * 1. Seules les méthodes non-idempotentes (POST, PATCH, DELETE) sont concernées
 * 2. Si une clé d'idempotence est fournie et qu'une réponse existe en cache, on la retourne
 * 3. Sinon, on exécute la requête normalement et on met la réponse en cache
 * 4. Les erreurs de cache ne bloquent pas la requête (dégradation gracieuse)
 */
@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(IdempotencyMiddleware.name);

  constructor(private readonly idempotencyService: IdempotencyService) {}

  /**
   * Méthode principale du middleware
   * @param req - Requête Express
   * @param res - Réponse Express
   * @param next - Fonction next pour passer au middleware suivant
   */
  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    // 1. Filtrage des méthodes HTTP - uniquement les méthodes non-idempotentes
    const nonIdempotentMethods: ReadonlyArray<string> = ['POST', 'PATCH', 'DELETE'];
    if (!nonIdempotentMethods.includes(req.method)) {
      next();
      return;
    }

    // 2. Récupération de la clé d'idempotence depuis les en-têtes
    const key = this.extractIdempotencyKey(req);
    if (!key) {
      // Pas de clé, on laisse passer sans gestion d'idempotence
      next();
      return;
    }

    try {
      // 3. Vérification du cache existant
      const cached = await this.idempotencyService.getCachedResponse(key, req.method);
      
      if (this.isValidCachedResponse(cached)) {
        // 4. Cache hit : on retourne la réponse mise en cache
        this.logger.debug(`Idempotency cache hit for key: ${key}`);
        this.sendCachedResponse(res, cached);
        return;
      }

      // 5. Cache miss : on va exécuter la requête normalement
      await this.executeWithCaching(req, res, key, next);
    } catch (error) {
      // 6. Gestion des erreurs - on loggue et on continue (dégradation gracieuse)
      this.handleMiddlewareError(error, key, next);
    }
  }

  /**
   * Extrait la clé d'idempotence des en-têtes de la requête.
   * @param req - Requête Express
   * @returns La clé d'idempotence ou undefined si non trouvée
   */
  private extractIdempotencyKey(req: Request): string | undefined {
    // L'en-tête peut être en minuscules car Express normalise automatiquement
    const headerKey = IDEMPOTENCY_KEY_HEADER.toLowerCase();
    const key = req.headers[headerKey];
    
    if (Array.isArray(key)) {
      return key[0]; // Si plusieurs valeurs, on prend la première
    }
    
    return key;
  }

  /**
   * Vérifie si une réponse en cache est valide.
   * @param cached - Réponse potentiellement en cache
   * @returns true si la réponse est valide
   */
  private isValidCachedResponse(cached: unknown): cached is CachedResponse {
    if (!cached || typeof cached !== 'object') {
      return false;
    }
    
    const candidate = cached as Partial<CachedResponse>;
    return (
      typeof candidate.statusCode === 'number' &&
      candidate.statusCode >= 100 &&
      candidate.statusCode < 600 &&
      'body' in candidate
    );
  }

  /**
   * Envoie une réponse mise en cache.
   * @param res - Réponse Express
   * @param cached - Réponse en cache
   */
  private sendCachedResponse(res: Response, cached: CachedResponse): void {
    res.status(cached.statusCode).json(cached.body);
  }

  /**
   * Exécute la requête normalement et met en cache la réponse.
   * @param req - Requête Express
   * @param res - Réponse Express
   * @param key - Clé d'idempotence
   * @param next - Fonction next
   */
  private async executeWithCaching(
    req: Request,
    res: Response,
    key: string,
    next: NextFunction,
  ): Promise<void> {
    // Sauvegarde de la fonction send originale
    const originalSend = res.send.bind(res) as SendFunction;

    // Remplacement temporaire de res.send pour capturer la réponse
    res.send = (body?: unknown): Response => {
      // Restauration de la fonction originale
      res.send = originalSend;

      // Mise en cache asynchrone (ne bloque pas la réponse)
      this.cacheResponseAsync(key, res.statusCode, body, req.method);

      // Appel de la fonction originale
      return originalSend(body);
    };

    // Passage au middleware suivant
    next();
  }

  /**
   * Met en cache la réponse de manière asynchrone.
   * @param key - Clé d'idempotence
   * @param statusCode - Code HTTP de la réponse
   * @param body - Corps de la réponse
   * @param method - Méthode HTTP
   */
  private cacheResponseAsync(
    key: string,
    statusCode: number,
    body: unknown,
    method: string,
  ): void {
    // On ne bloque pas la réponse, on gère l'erreur silencieusement
    this.idempotencyService
      .cacheResponse(
        key,
        {
          statusCode,
          body,
        },
        method,
      )
      .catch((error: unknown) => {
        const err = error instanceof Error ? error : new Error(String(error));
        this.logger.error(
          `Failed to cache idempotent response for key ${key}: ${err.message}`,
          err.stack,
        );
      });
  }

  /**
   * Gère les erreurs du middleware.
   * @param error - Erreur capturée
   * @param key - Clé d'idempotence (pour le logging)
   * @param next - Fonction next
   */
  private handleMiddlewareError(error: unknown, key: string | undefined, next: NextFunction): void {
    const err = error instanceof Error ? error : new Error(String(error));
    this.logger.error(
      `Idempotency middleware error for key ${key ?? 'unknown'}: ${err.message}`,
      err.stack,
    );
    // Dégradation gracieuse : on laisse passer la requête
    next();
  }
}