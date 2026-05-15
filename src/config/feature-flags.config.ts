import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

/**
 * Schéma de validation pour la configuration des feature flags.
 * Les feature flags permettent d'activer/désactiver des fonctionnalités sans redéployer.
 */
export const featureFlagsConfigSchema = Joi.object({
  FEATURE_FLAGS_ENABLED: Joi.boolean()
    .default(true)
    .description(
      'Active globalement le système de feature flags (si false, tous les flags sont considérés comme désactivés)',
    ),

  FEATURE_FLAGS_PROVIDER: Joi.string()
    .valid('env', 'redis', 'database')
    .default('env')
    .description(
      "Source de vérité pour les flags : variables d'environnement, Redis, ou base de données",
    ),

  FEATURE_FLAGS_CACHE_TTL: Joi.number()
    .default(60)
    .description(
      'Durée de vie du cache des flags (en secondes) lorsque le provider supporte le caching',
    ),
});

/**
 * Interface de la configuration des feature flags.
 */
export interface FeatureFlagsConfig {
  enabled: boolean;
  provider: 'env' | 'redis' | 'database';
  cacheTtl: number;
}

/**
 * Enregistrement de la configuration des feature flags.
 * Lit les variables d'environnement et applique des valeurs par défaut.
 */
export default registerAs('featureFlags', (): FeatureFlagsConfig => {
  // FEATURE_FLAGS_ENABLED est true par défaut ; on désactive uniquement si la variable vaut 'false'
  const enabled = (process.env.FEATURE_FLAGS_ENABLED ?? 'true') !== 'false';

  // Provider : par défaut 'env', mais si une autre valeur est fournie, elle doit être validée par Joi
  const provider = (process.env.FEATURE_FLAGS_PROVIDER ??
    'env') as FeatureFlagsConfig['provider'];

  // Cache TTL : entier, fallback 60 secondes
  const cacheTtl =
    parseInt(process.env.FEATURE_FLAGS_CACHE_TTL ?? '60', 10) || 60;

  return {
    enabled,
    provider,
    cacheTtl,
  };
});
