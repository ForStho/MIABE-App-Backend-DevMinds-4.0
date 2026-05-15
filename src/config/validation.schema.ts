import * as Joi from 'joi';
import { appConfigSchema } from './app.config';
import { databaseConfigSchema } from './database.config';
import { redisConfigSchema } from './redis.config';
import { jwtConfigSchema } from './jwt.config';
import { storageConfigSchema } from './storage.config';
import { queueConfigSchema } from './queue.config';
import { mailConfigSchema } from './mail.config';
import { telemetryConfigSchema } from './telemetry.config';
import { metricsConfigSchema } from './metrics.config';
import { tenantConfigSchema } from './tenant.config';
import { idempotencyConfigSchema } from './idempotency.config';
import { featureFlagsConfigSchema } from './feature-flags.config';
import { resilienceConfigSchema } from './resilience.config';
import { securityConfigSchema } from './security.config';

/**
 * Schéma de validation global combinant tous les schémas individuels.
 *
 * Ce schéma est utilisé par le ConfigModule de NestJS pour valider l'ensemble
 * des variables d'environnement au démarrage de l'application. Chaque sous-schéma
 * est fusionné via `concat`, ce qui permet d'obtenir un schéma unique contenant
 * toutes les règles de validation.
 *
 * La fusion garantit qu'il n'y a pas de conflits entre les noms de variables
 * (tous les schémas utilisent des noms distincts, par exemple APP_*, DB_*, etc.).
 * Si un conflit survenait, Joi lèverait une erreur lors de la concaténation.
 *
 * En cas d'échec de validation, l'application ne démarrera pas, ce qui est
 * le comportement souhaité pour éviter des exécutions avec une configuration
 * incomplète ou erronée.
 */
export const validationSchema = Joi.object()
  .concat(appConfigSchema)
  .concat(databaseConfigSchema)
  .concat(redisConfigSchema)
  .concat(jwtConfigSchema)
  .concat(storageConfigSchema)
  .concat(queueConfigSchema)
  .concat(mailConfigSchema)
  .concat(telemetryConfigSchema)
  .concat(metricsConfigSchema)
  .concat(tenantConfigSchema)
  .concat(idempotencyConfigSchema)
  .concat(featureFlagsConfigSchema)
  .concat(resilienceConfigSchema)
  .concat(securityConfigSchema);
