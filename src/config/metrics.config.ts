import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

/**
 * Schéma de validation pour la configuration des métriques (Prometheus).
 *
 * Les métriques permettent de surveiller la santé et les performances de l'application.
 * Par défaut, elles sont désactivées pour éviter d'exposer inutilement un endpoint en production,
 * sauf si explicitement activé.
 */
export const metricsConfigSchema = Joi.object({
  METRICS_ENABLED: Joi.boolean()
    .default(false)
    .description(
      "Active l'exposition des métriques sur un endpoint dédié. " +
        'À activer uniquement si vous utilisez un outil de monitoring comme Prometheus.',
    ),

  METRICS_ENDPOINT: Joi.string()
    .default('/metrics')
    .description(
      "Chemin d'accès pour récupérer les métriques (ex: /metrics, /api/metrics)",
    ),

  METRICS_PREFIX: Joi.string()
    .default('app_')
    .description(
      'Préfixe ajouté à tous les noms de métriques pour éviter les collisions ' +
        "avec d'autres applications dans le même système de monitoring.",
    ),
});

/**
 * Interface de configuration des métriques.
 */
export interface MetricsConfig {
  enabled: boolean;
  endpoint: string;
  prefix: string;
}

/**
 * Enregistrement de la configuration 'metrics'.
 *
 * Les valeurs par défaut sont choisies pour être cohérentes avec les conventions Prometheus.
 * Le préfixe 'app_' permet d'identifier rapidement les métriques de cette application.
 */
export default registerAs(
  'metrics',
  (): MetricsConfig => ({
    // Activé uniquement si la variable vaut exactement 'true' (insensible à la casse ? ici non, mais on peut l'améliorer avec toLowerCase)
    enabled: (process.env.METRICS_ENABLED ?? 'false') === 'true',

    // Endpoint par défaut /metrics (respecte la convention Prometheus)
    endpoint: process.env.METRICS_ENDPOINT ?? '/metrics',

    // Préfixe par défaut 'app_'
    prefix: process.env.METRICS_PREFIX ?? 'app_',
  }),
);
