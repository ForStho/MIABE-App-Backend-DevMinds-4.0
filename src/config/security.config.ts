import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

/**
 * Schéma de validation pour la configuration de sécurité.
 *
 * Cette configuration couvre plusieurs aspects :
 * - Brute force : protection contre les attaques par force brute sur les endpoints sensibles.
 * - Réputation IP : vérification des IP suspectes via un service externe.
 * - Audit log : journalisation des actions critiques.
 * - Rotation des refresh tokens : sécurité renforcée pour les sessions.
 */
export const securityConfigSchema = Joi.object({
  // Brute force protection
  BRUTE_FORCE_ENABLED: Joi.boolean()
    .default(true)
    .description('Active la protection contre les attaques par force brute'),
  BRUTE_FORCE_MAX_ATTEMPTS: Joi.number()
    .default(5)
    .description('Nombre maximal de tentatives échouées avant blocage'),
  BRUTE_FORCE_WINDOW: Joi.number()
    .default(300)
    .description('Fenêtre de temps (en secondes) pour compter les tentatives'),
  BRUTE_FORCE_BLOCK_DURATION: Joi.number()
    .default(900)
    .description('Durée de blocage (en secondes) après dépassement du seuil'),

  // IP reputation (service externe)
  IP_REPUTATION_ENABLED: Joi.boolean()
    .default(false)
    .description(
      'Active la vérification de la réputation des adresses IP via un service comme AbuseIPDB',
    ),
  IP_REPUTATION_API_KEY: Joi.when('IP_REPUTATION_ENABLED', {
    is: true,
    then: Joi.string()
      .required()
      .description('Clé API pour le service de réputation IP'),
    otherwise: Joi.optional(),
  }),

  // Audit logging
  AUDIT_LOG_ENABLED: Joi.boolean()
    .default(true)
    .description(
      'Active la journalisation des événements sensibles (connexions, modifications critiques)',
    ),

  // Refresh token security
  REFRESH_TOKEN_ROTATION_ENABLED: Joi.boolean()
    .default(true)
    .description(
      'Active la rotation des refresh tokens : un nouveau token est émis à chaque utilisation',
    ),
  REFRESH_TOKEN_REUSE_DETECTION: Joi.boolean()
    .default(true)
    .description(
      "Détecte et bloque la réutilisation d'un ancien refresh token (protection contre le vol)",
    ),
});

/**
 * Interface de configuration de sécurité.
 */
export interface SecurityConfig {
  bruteForce: {
    enabled: boolean;
    maxAttempts: number;
    window: number;
    blockDuration: number;
  };
  ipReputation: {
    enabled: boolean;
    apiKey?: string;
  };
  auditLog: {
    enabled: boolean;
  };
  refreshToken: {
    rotationEnabled: boolean;
    reuseDetection: boolean;
  };
}

/**
 * Enregistrement de la configuration 'security'.
 *
 * Les booléens sont interprétés : si la variable est absente, on prend la valeur par défaut.
 * Pour BRUTE_FORCE_ENABLED, on considère true par défaut (sauf si explicitement 'false').
 * Même logique pour REFRESH_TOKEN_*.
 */
export default registerAs('security', (): SecurityConfig => {
  // Brute force
  const bfEnabled = (process.env.BRUTE_FORCE_ENABLED ?? 'true') !== 'false';
  const bfMaxAttempts =
    parseInt(process.env.BRUTE_FORCE_MAX_ATTEMPTS ?? '5', 10) || 5;
  const bfWindow = parseInt(process.env.BRUTE_FORCE_WINDOW ?? '300', 10) || 300;
  const bfBlockDuration =
    parseInt(process.env.BRUTE_FORCE_BLOCK_DURATION ?? '900', 10) || 900;

  // IP reputation
  const ipRepEnabled =
    (process.env.IP_REPUTATION_ENABLED ?? 'false') === 'true';
  const ipRepApiKey = process.env.IP_REPUTATION_API_KEY;

  // Audit log
  const auditLogEnabled = (process.env.AUDIT_LOG_ENABLED ?? 'true') !== 'false';

  // Refresh token
  const rtRotation =
    (process.env.REFRESH_TOKEN_ROTATION_ENABLED ?? 'true') !== 'false';
  const rtReuse =
    (process.env.REFRESH_TOKEN_REUSE_DETECTION ?? 'true') !== 'false';

  return {
    bruteForce: {
      enabled: bfEnabled,
      maxAttempts: bfMaxAttempts,
      window: bfWindow,
      blockDuration: bfBlockDuration,
    },
    ipReputation: {
      enabled: ipRepEnabled,
      apiKey: ipRepApiKey,
    },
    auditLog: {
      enabled: auditLogEnabled,
    },
    refreshToken: {
      rotationEnabled: rtRotation,
      reuseDetection: rtReuse,
    },
  };
});
