import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

/**
 * Schéma de validation Joi pour la configuration générale de l'application.
 * Ce schéma définit la structure, les types, les valeurs par défaut et les contraintes
 * de chaque variable d'environnement utilisée par l'application.
 * Il est utilisé lors du démarrage pour valider que toutes les variables requises sont présentes
 * et que leurs valeurs sont conformes.
 */
export const appConfigSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .description(
      "Environnement d'exécution (influence le comportement de l'application, ex: logs, debugging)",
    ),

  PORT: Joi.number()
    .default(3000)
    .description(
      'Port sur lequel le serveur HTTP écoutera les connexions entrantes',
    ),

  BASE_URL: Joi.string()
    .uri()
    .required()
    .description(
      "URL publique de base de l'application (utilisée pour générer des liens absolus, ex: emails, webhooks)",
    ),

  CORS_ENABLED: Joi.boolean()
    .default(true)
    .description(
      'Active ou désactive globalement le mécanisme CORS (Cross-Origin Resource Sharing)',
    ),

  CORS_ALLOWED_ORIGINS: Joi.string()
    .default('*')
    .description(
      "Liste des origines autorisées pour les requêtes CORS, séparées par des virgules. '*' autorise toutes les origines (à éviter en production)",
    ),

  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info')
    .description(
      'Niveau de verbosité des logs (plus on monte dans la hiérarchie, plus on a de détails)',
    ),

  API_PREFIX: Joi.string()
    .default('api')
    .description(
      "Préfixe global pour toutes les routes de l'API (ex: /api/users)",
    ),
});

/**
 * Interface TypeScript décrivant la forme de l'objet de configuration 'app'.
 * Elle garantit le typage fort dans le reste de l'application lorsqu'on injecte cette configuration.
 */
export interface AppConfig {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  baseUrl: string;
  corsEnabled: boolean;
  corsAllowedOrigins: string[]; // Transformé en tableau après lecture du .env
  logLevel: 'error' | 'warn' | 'info' | 'debug' | 'verbose';
  apiPrefix: string;
}

/**
 * Enregistre la configuration 'app' auprès du module Config de NestJS.
 * La fonction lit les variables d'environnement, applique des valeurs par défaut,
 * et transforme certaines données (ex: chaîne en booléen, chaîne en tableau).
 * Note : la validation via Joi aura lieu en amont (généralement dans le module racine),
 * donc ici on se contente d'extraire et transformer les valeurs brutes.
 */
export default registerAs('app', (): AppConfig => {
  // Récupération de NODE_ENV avec fallback 'development' (mais Joi imposera une valeur valide de toute façon)
  const nodeEnv = (process.env.NODE_ENV ??
    'development') as AppConfig['nodeEnv'];

  // Conversion explicite en nombre, avec fallback 3000 si parseInt échoue (NaN)
  const port = parseInt(process.env.PORT ?? '3000', 10) || 3000;

  // BASE_URL est requis, donc si elle est absente, Joi lèvera une erreur. On laisse vide ici.
  const baseUrl = process.env.BASE_URL ?? '';

  // Conversion de la chaîne 'true'/'false' en booléen (insensible à la casse ? non, on teste strictement 'true')
  const corsEnabled = (process.env.CORS_ENABLED ?? 'true') === 'true';

  // Transformation de la liste d'origines (séparées par des virgules) en tableau, en supprimant les espaces superflus
  const corsAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? '*')
    .split(',')
    .map((s) => s.trim());

  // LOG_LEVEL avec fallback 'info' (Joi validera que c'est bien une valeur autorisée)
  const logLevel = (process.env.LOG_LEVEL ?? 'info') as AppConfig['logLevel'];

  // API_PREFIX avec fallback 'api'
  const apiPrefix = process.env.API_PREFIX ?? 'api';

  // Retourne l'objet de configuration typé, prêt à être injecté
  return {
    nodeEnv,
    port,
    baseUrl,
    corsEnabled,
    corsAllowedOrigins,
    logLevel,
    apiPrefix,
  };
});
