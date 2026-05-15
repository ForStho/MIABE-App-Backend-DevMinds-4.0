/**
 * Point d'entrée principal de la configuration de l'application.
 *
 * Ce fichier importe toutes les configurations modulaires définies via `registerAs`
 * et les exporte sous forme de tableau. Ce tableau est ensuite passé à
 * `ConfigModule.forRoot()` dans le module racine pour charger et enregistrer
 * toutes les configurations auprès du système de configuration de NestJS.
 *
 * ## Pourquoi cette approche ?
 * - **Modularité** : chaque domaine fonctionnel (base de données, JWT, stockage, etc.)
 *   possède son propre fichier de configuration, ce qui facilite la maintenance
 *   et l'évolution indépendante.
 * - **Validation ciblée** : chaque configuration embarque son propre schéma Joi,
 *   ce qui permet une validation précise et isolée.
 * - **Extensibilité** : ajouter une nouvelle fonctionnalité revient à créer un
 *   nouveau fichier de configuration et à l'importer ici, sans toucher aux autres.
 * - **Typage fort** : chaque configuration exporte une interface TypeScript qui
 *   peut être utilisée pour typer les injections de `ConfigService`.
 *
 * ## Fonctionnement
 * Chaque élément du tableau est une fonction fabrique enregistrée via `registerAs`.
 * NestJS appelle ces fonctions au démarrage, fusionne leurs résultats dans un objet
 * unique (clé par espace de noms) et le rend disponible via `ConfigService`.
 *
 * L'ordre des importations n'a pas d'importance car les espaces de noms sont distincts.
 *
 * @see https://docs.nestjs.com/techniques/configuration#configuration-namespaces
 */
import appConfig from './app.config';
import databaseConfig from './database.config';
import redisConfig from './redis.config';
import jwtConfig from './jwt.config';
import storageConfig from './storage.config';
import queueConfig from './queue.config';
import mailConfig from './mail.config';
import telemetryConfig from './telemetry.config';
import metricsConfig from './metrics.config';
import tenantConfig from './tenant.config';
import idempotencyConfig from './idempotency.config';
import featureFlagsConfig from './feature-flags.config';
import resilienceConfig from './resilience.config';
import securityConfig from './security.config';
import activityLogsConfig from './activity-logs.config';

/**
 * Tableau de toutes les configurations namespacées.
 * Ce tableau est directement consommé par `ConfigModule.forRoot({ load: [...] })`.
 */
export default [
  appConfig,
  databaseConfig,
  redisConfig,
  jwtConfig,
  storageConfig,
  queueConfig,
  mailConfig,
  telemetryConfig,
  metricsConfig,
  tenantConfig,
  idempotencyConfig,
  featureFlagsConfig,
  resilienceConfig,
  securityConfig,
  activityLogsConfig,
];
