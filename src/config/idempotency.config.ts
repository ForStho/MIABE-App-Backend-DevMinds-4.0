import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

/**
 * Schéma de validation pour la configuration du mécanisme d'idempotence.
 * L'idempotence permet d'éviter les traitements en double pour une même requête (ex: paiements).
 */
export const idempotencyConfigSchema = Joi.object({
  IDEMPOTENCY_ENABLED: Joi.boolean()
    .default(true)
    .description(
      'Active ou désactive globalement la protection par idempotence',
    ),

  IDEMPOTENCY_TTL: Joi.number()
    .default(86400)
    .description(
      "Durée de conservation d'une clé d'idempotence (en secondes). 86400 = 24h.",
    ),

  IDEMPOTENCY_KEY_HEADER: Joi.string()
    .default('Idempotency-Key')
    .description("Nom de l'en-tête HTTP contenant la clé d'idempotence"),

  IDEMPOTENCY_PREFIX: Joi.string()
    .default('idempotency:')
    .description(
      'Préfixe utilisé pour stocker les clés dans le cache/Redis (évite les collisions)',
    ),
});

/**
 * Interface de la configuration d'idempotence.
 */
export interface IdempotencyConfig {
  enabled: boolean;
  ttl: number;
  keyHeader: string;
  prefix: string;
}

/**
 * Enregistrement de la configuration d'idempotence.
 */
export default registerAs('idempotency', (): IdempotencyConfig => {
  // Active par défaut, sauf si explicitement 'false'
  const enabled = (process.env.IDEMPOTENCY_ENABLED ?? 'true') !== 'false';

  // TTL : 86400s = 24h, valeur classique pour une fenêtre d'idempotence
  const ttl = parseInt(process.env.IDEMPOTENCY_TTL ?? '86400', 10) || 86400;

  // Nom de l'en-tête personnalisable
  const keyHeader = process.env.IDEMPOTENCY_KEY_HEADER ?? 'Idempotency-Key';

  // Préfixe pour les clés de cache
  const prefix = process.env.IDEMPOTENCY_PREFIX ?? 'idempotency:';

  return {
    enabled,
    ttl,
    keyHeader,
    prefix,
  };
});
