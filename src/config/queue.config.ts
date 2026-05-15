import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

/**
 * Schéma de validation pour la configuration des queues Bull (gestion des tâches asynchrones).
 *
 * Bull utilise Redis comme backend. Cette configuration permet de spécifier la connexion Redis
 * dédiée aux queues (souvent distincte de la base de données principale) ainsi que les options
 * par défaut pour les jobs (tentatives, backoff, nettoyage).
 */
export const queueConfigSchema = Joi.object({
  // Paramètres de connexion Redis (spécifiques aux queues)
  QUEUE_REDIS_HOST: Joi.string()
    .default('localhost')
    .description(
      'Hôte Redis pour les queues (peut être différent du Redis principal)',
    ),

  QUEUE_REDIS_PORT: Joi.number()
    .default(6379)
    .description('Port Redis pour les queues'),

  QUEUE_REDIS_PASSWORD: Joi.string()
    .optional()
    .allow('')
    .description(
      'Mot de passe Redis pour les queues (laisser vide si non requis)',
    ),

  QUEUE_REDIS_DB: Joi.number()
    .default(0)
    .description('Index de la base Redis (pour isoler les données des queues)'),

  // Options Bull générales
  QUEUE_PREFIX: Joi.string()
    .default('bull')
    .description(
      "Préfixe des clés Redis utilisées par Bull (évite les collisions avec d'autres applications)",
    ),

  // Options par défaut pour tous les jobs (peuvent être surchargées par job)
  QUEUE_DEFAULT_JOB_OPTIONS: Joi.object({
    attempts: Joi.number()
      .default(3)
      .description("Nombre maximum de tentatives en cas d'échec"),

    backoff: Joi.object({
      type: Joi.string()
        .valid('fixed', 'exponential')
        .default('exponential')
        .description(
          "Stratégie d'attente entre les tentatives : fixe ou exponentielle",
        ),

      delay: Joi.number()
        .default(1000)
        .description('Délai initial de backoff (en ms)'),
    }).default(),

    removeOnComplete: Joi.boolean()
      .default(false)
      .description(
        'Supprimer automatiquement le job de Redis une fois terminé (économise de la mémoire)',
      ),

    removeOnFail: Joi.boolean()
      .default(false)
      .description(
        "Supprimer automatiquement le job de Redis en cas d'échec (utile pour le débogage si false)",
      ),
  }).default(),
});

/**
 * Interface de configuration des queues.
 * Les propriétés sont structurées pour correspondre à l'objet attendu par Bull.
 */
export interface QueueConfig {
  redis: {
    host: string;
    port: number;
    password?: string; // Optionnel
    db: number;
  };
  prefix: string;
  defaultJobOptions: {
    attempts: number;
    backoff: {
      type: 'fixed' | 'exponential';
      delay: number;
    };
    removeOnComplete: boolean;
    removeOnFail: boolean;
  };
}

/**
 * Enregistrement de la configuration 'queue'.
 *
 * On décompose les variables d'environnement individuelles pour construire un objet structuré.
 * Les options de backoff sont définies séparément car Joi ne peut pas valider directement
 * un objet imbriqué à partir de variables d'environnement plates. On utilise donc des variables
 * comme QUEUE_BACKOFF_TYPE et QUEUE_BACKOFF_DELAY.
 */
export default registerAs('queue', (): QueueConfig => {
  // Paramètres de connexion Redis
  const redisHost = process.env.QUEUE_REDIS_HOST ?? 'localhost';
  const redisPort =
    parseInt(process.env.QUEUE_REDIS_PORT ?? '6379', 10) || 6379;
  const redisPassword = process.env.QUEUE_REDIS_PASSWORD; // peut être undefined
  const redisDb = parseInt(process.env.QUEUE_REDIS_DB ?? '0', 10) || 0;
  const prefix = process.env.QUEUE_PREFIX ?? 'bull';

  // Options par défaut des jobs
  const defaultAttempts =
    parseInt(process.env.QUEUE_DEFAULT_ATTEMPTS ?? '3', 10) || 3;
  const backoffType = (process.env.QUEUE_BACKOFF_TYPE ?? 'exponential') as
    | 'fixed'
    | 'exponential';
  const backoffDelay =
    parseInt(process.env.QUEUE_BACKOFF_DELAY ?? '1000', 10) || 1000;
  const removeOnComplete =
    (process.env.QUEUE_REMOVE_ON_COMPLETE ?? 'false') === 'true';
  const removeOnFail = (process.env.QUEUE_REMOVE_ON_FAIL ?? 'false') === 'true';

  return {
    redis: {
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      db: redisDb,
    },
    prefix,
    defaultJobOptions: {
      attempts: defaultAttempts,
      backoff: {
        type: backoffType,
        delay: backoffDelay,
      },
      removeOnComplete,
      removeOnFail,
    },
  };
});
