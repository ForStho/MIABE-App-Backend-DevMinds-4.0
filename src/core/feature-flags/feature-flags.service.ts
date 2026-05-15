import { Injectable, OnModuleInit, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service'; // Service Redis (à créer, mais supposé existant)

/**
 * Interface décrivant la configuration des feature flags.
 * Correspond à la configuration chargée depuis `feature-flags.config.ts`.
 */
export interface FeatureFlagsConfig {
  provider: 'env' | 'redis' | 'database';
  cacheTtl: number;
}

/**
 * Service de gestion des feature flags.
 *
 * Ce service charge les flags depuis le provider configuré (variables d'environnement,
 * Redis, ou base de données) et les stocke en mémoire. Il permet de vérifier
 * l'état d'un flag et de le modifier (persistance selon le provider).
 *
 * Il implémente `OnModuleInit` pour charger les flags au démarrage.
 */
@Injectable()
export class FeatureFlagsService implements OnModuleInit {
  // Stockage interne des flags (nom -> booléen)
  private flags: Map<string, boolean> = new Map();

  // Provider actuel (env, redis, database)
  private provider: FeatureFlagsConfig['provider'];

  // Durée de vie du cache (non utilisée ici, mais pourrait être utilisée pour un rafraîchissement périodique)
  private cacheTtl: number;

  constructor(
    private configService: ConfigService,
    @Optional() private redisService?: RedisService, // Optionnel, car le provider peut être 'env'
  ) {
    // Récupération de la configuration typée depuis l'espace de noms 'featureFlags'
    const featureConfig =
      this.configService.get<FeatureFlagsConfig>('featureFlags');

    // Valeurs par défaut (au cas où la config serait absente)
    this.provider = featureConfig?.provider ?? 'env';
    this.cacheTtl = featureConfig?.cacheTtl ?? 60;
  }

  /**
   * Hook appelé après l'initialisation du module.
   * Charge les flags selon le provider configuré.
   */
  async onModuleInit() {
    if (this.provider === 'env') {
      this.loadFromEnv();
    } else if (this.provider === 'redis' && this.redisService) {
      await this.loadFromRedis();
    } else if (this.provider === 'database') {
      // Implémentation à venir : charger depuis la base de données
      // this.loadFromDatabase();
    }
  }

  /**
   * Charge les flags depuis les variables d'environnement.
   * Toute variable commençant par 'FEATURE_' est considérée comme un flag.
   * Le nom du flag est la partie après 'FEATURE_' convertie en minuscules.
   * La valeur est interprétée comme booléen (true si 'true', false sinon).
   */
  private loadFromEnv() {
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith('FEATURE_')) {
        const flagName = key.replace('FEATURE_', '').toLowerCase();
        this.flags.set(flagName, process.env[key] === 'true');
      }
    });
  }

  /**
   * Charge les flags depuis Redis.
   * On suppose que les flags sont stockés dans une hash Redis nommée 'feature-flags'.
   * Chaque champ est le nom du flag, la valeur est 'true' ou 'false'.
   */
  private async loadFromRedis() {
    // On utilise l'assertion non-null car on a vérifié que redisService existe dans cette branche
    const client = this.redisService!.getClient();
    const data = await client.hgetall('feature-flags');
    Object.entries(data).forEach(([key, value]) => {
      this.flags.set(key, value === 'true');
    });
  }

  /**
   * Vérifie si un flag est activé.
   *
   * @param flag - Nom du flag (en minuscules généralement)
   * @returns true si le flag est activé, false s'il n'existe pas ou est désactivé
   */
  isEnabled(flag: string): boolean {
    return this.flags.get(flag) ?? false;
  }

  /**
   * Active ou désactive un flag.
   * Met à jour le cache en mémoire, et persiste selon le provider (Redis uniquement pour l'instant).
   *
   * @param flag - Nom du flag
   * @param enabled - true pour activer, false pour désactiver
   */
  async setFlag(flag: string, enabled: boolean): Promise<void> {
    this.flags.set(flag, enabled);

    // Si le provider est Redis, on persiste immédiatement
    if (this.provider === 'redis' && this.redisService) {
      const client = this.redisService.getClient();
      await client.hset('feature-flags', flag, String(enabled));
    }
    // Pour le provider 'env', on ne peut pas persister (variables d'environnement en lecture seule)
    // Pour 'database', il faudrait implémenter la persistance
  }
}
