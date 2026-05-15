import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

/**
 * Schéma de validation pour la configuration de résilience (circuit breaker, retry, timeout).
 *
 * Ces mécanismes permettent à l'application de résister aux défaillances des services externes
 * et de s'adapter aux conditions de charge. Les valeurs par défaut sont choisies pour un
 * compromis entre robustesse et performance.
 */
export const resilienceConfigSchema = Joi.object({
  // Circuit Breaker (interrompt les appels vers un service défaillant)
  CIRCUIT_BREAKER_ENABLED: Joi.boolean()
    .default(true)
    .description('Active le circuit breaker pour les appels externes'),
  CIRCUIT_BREAKER_TIMEOUT: Joi.number()
    .default(5000)
    .description(
      "Délai maximal d'attente d'une réponse (en ms) avant ouverture du circuit",
    ),
  CIRCUIT_BREAKER_ERROR_THRESHOLD: Joi.number()
    .min(0)
    .max(100)
    .default(50)
    .description("Pourcentage d'erreurs déclenchant l'ouverture du circuit"),
  CIRCUIT_BREAKER_RESET_TIMEOUT: Joi.number()
    .default(30000)
    .description(
      'Durée (en ms) avant de passer en état half-open pour tester la reprise',
    ),

  // Retry (réessai automatique en cas d'échec transitoire)
  RETRY_ENABLED: Joi.boolean()
    .default(true)
    .description('Active les tentatives de réessai'),
  RETRY_MAX_ATTEMPTS: Joi.number()
    .default(3)
    .description('Nombre maximal de tentatives (y compris la première)'),
  RETRY_BACKOFF: Joi.number()
    .default(1000)
    .description(
      'Délai initial entre les tentatives (en ms), doublé à chaque échec si backoff exponentiel',
    ),

  // Timeout global
  TIMEOUT_ENABLED: Joi.boolean()
    .default(true)
    .description('Active le timeout global pour les requêtes'),
  TIMEOUT_DEFAULT: Joi.number()
    .default(10000)
    .description('Timeout par défaut (en ms) pour les opérations'),
});

/**
 * Interface de configuration de résilience.
 * Les propriétés sont regroupées par fonctionnalité.
 */
export interface ResilienceConfig {
  circuitBreaker: {
    enabled: boolean;
    timeout: number;
    errorThreshold: number;
    resetTimeout: number;
  };
  retry: {
    enabled: boolean;
    maxAttempts: number;
    backoff: number;
  };
  timeout: {
    enabled: boolean;
    default: number;
  };
}

/**
 * Enregistrement de la configuration 'resilience'.
 *
 * Les valeurs par défaut sont appliquées et les booléens sont convertis.
 * Les seuils sont bornés par la validation Joi.
 */
export default registerAs('resilience', (): ResilienceConfig => {
  // Circuit breaker
  const cbEnabled = (process.env.CIRCUIT_BREAKER_ENABLED ?? 'true') !== 'false';
  const cbTimeout =
    parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT ?? '5000', 10) || 5000;
  const cbErrorThreshold =
    parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD ?? '50', 10) || 50;
  const cbResetTimeout =
    parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT ?? '30000', 10) || 30000;

  // Retry
  const retryEnabled = (process.env.RETRY_ENABLED ?? 'true') !== 'false';
  const retryMaxAttempts =
    parseInt(process.env.RETRY_MAX_ATTEMPTS ?? '3', 10) || 3;
  const retryBackoff =
    parseInt(process.env.RETRY_BACKOFF ?? '1000', 10) || 1000;

  // Timeout
  const timeoutEnabled = (process.env.TIMEOUT_ENABLED ?? 'true') !== 'false';
  const timeoutDefault =
    parseInt(process.env.TIMEOUT_DEFAULT ?? '10000', 10) || 10000;

  return {
    circuitBreaker: {
      enabled: cbEnabled,
      timeout: cbTimeout,
      errorThreshold: cbErrorThreshold,
      resetTimeout: cbResetTimeout,
    },
    retry: {
      enabled: retryEnabled,
      maxAttempts: retryMaxAttempts,
      backoff: retryBackoff,
    },
    timeout: {
      enabled: timeoutEnabled,
      default: timeoutDefault,
    },
  };
});
