import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

/**
 * Schéma de validation pour la configuration Redis.
 *
 * Supporte trois modes de déploiement :
 * - Standalone : un seul nœud Redis
 * - Cluster : plusieurs nœuds Redis en cluster
 * - Sentinel : haute disponibilité avec Redis Sentinel
 *
 * La configuration utilise des conditions Joi (`when`) pour rendre certains champs requis
 * uniquement lorsque le mode correspondant est activé.
 */
export const redisConfigSchema = Joi.object({
  // Configuration de base (utilisée en mode standalone)
  REDIS_HOST: Joi.string()
    .required()
    .description('Hôte Redis (pour mode standalone)'),
  REDIS_PORT: Joi.number().default(6379).description('Port Redis'),
  REDIS_PASSWORD: Joi.string()
    .optional()
    .allow('')
    .description('Mot de passe Redis (si nécessaire)'),
  REDIS_DB: Joi.number()
    .default(0)
    .description('Index de la base de données Redis (0 par défaut)'),
  REDIS_TLS: Joi.boolean()
    .default(false)
    .description('Activer TLS pour sécuriser la connexion'),

  // Mode Cluster
  REDIS_CLUSTER_ENABLED: Joi.boolean()
    .default(false)
    .description('Activer le mode cluster (si plusieurs nœuds Redis)'),
  REDIS_CLUSTER_NODES: Joi.when('REDIS_CLUSTER_ENABLED', {
    is: true,
    then: Joi.string()
      .required()
      .description(
        'Liste des nœuds du cluster, séparés par des virgules (ex: host1:6379,host2:6379)',
      ),
    otherwise: Joi.optional(),
  }),

  // Mode Sentinel
  REDIS_SENTINEL_ENABLED: Joi.boolean()
    .default(false)
    .description('Activer le mode Sentinel (haute disponibilité)'),
  REDIS_SENTINEL_NODES: Joi.when('REDIS_SENTINEL_ENABLED', {
    is: true,
    then: Joi.string()
      .required()
      .description(
        'Liste des nœuds Sentinel, séparés par des virgules (ex: sentinel1:26379,sentinel2:26379)',
      ),
    otherwise: Joi.optional(),
  }),
  REDIS_SENTINEL_MASTER_NAME: Joi.when('REDIS_SENTINEL_ENABLED', {
    is: true,
    then: Joi.string()
      .required()
      .description(
        'Nom du groupe master surveillé par Sentinel (ex: mymaster)',
      ),
    otherwise: Joi.optional(),
  }),
});

/**
 * Interface de configuration Redis.
 * Tous les champs optionnels sont marqués comme tels.
 */
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  tls: boolean;
  clusterEnabled: boolean;
  clusterNodes?: string[]; // Transformé en tableau après split
  sentinelEnabled: boolean;
  sentinelNodes?: string[]; // Transformé en tableau
  sentinelMasterName?: string;
}

/**
 * Enregistrement de la configuration 'redis'.
 *
 * Transforme les listes de nœuds en tableaux et applique les valeurs par défaut.
 * Note : la validation Joi garantit que si clusterEnabled est true, clusterNodes est fourni,
 * et de même pour sentinel.
 */
export default registerAs('redis', (): RedisConfig => {
  // Paramètres de base
  const host = process.env.REDIS_HOST ?? '';
  const port = parseInt(process.env.REDIS_PORT ?? '6379', 10) || 6379;
  const password = process.env.REDIS_PASSWORD;
  const db = parseInt(process.env.REDIS_DB ?? '0', 10) || 0;
  const tls = (process.env.REDIS_TLS ?? 'false') === 'true';

  // Mode cluster
  const clusterEnabled =
    (process.env.REDIS_CLUSTER_ENABLED ?? 'false') === 'true';
  const clusterNodes = process.env.REDIS_CLUSTER_NODES
    ? process.env.REDIS_CLUSTER_NODES.split(',').map((s) => s.trim())
    : undefined;

  // Mode sentinel
  const sentinelEnabled =
    (process.env.REDIS_SENTINEL_ENABLED ?? 'false') === 'true';
  const sentinelNodes = process.env.REDIS_SENTINEL_NODES
    ? process.env.REDIS_SENTINEL_NODES.split(',').map((s) => s.trim())
    : undefined;
  const sentinelMasterName = process.env.REDIS_SENTINEL_MASTER_NAME;

  return {
    host,
    port,
    password,
    db,
    tls,
    clusterEnabled,
    clusterNodes,
    sentinelEnabled,
    sentinelNodes,
    sentinelMasterName,
  };
});
