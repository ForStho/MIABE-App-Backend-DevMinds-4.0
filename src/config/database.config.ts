import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

/**
 * Schéma de validation Joi pour la configuration de la base de données MongoDB.
 * Il assure que les paramètres critiques sont fournis et que les valeurs optionnelles
 * respectent les types et contraintes attendus.
 */
export const databaseConfigSchema = Joi.object({
  MONGODB_URI: Joi.string()
    .required()
    .description(
      'URI de connexion MongoDB (ex: mongodb://user:pass@host:port/db)',
    ),

  MONGODB_DEBUG: Joi.boolean()
    .default(false)
    .description(
      'Active le mode debug de Mongoose (affiche les requêtes exécutées dans la console)',
    ),

  MONGODB_POOL_SIZE: Joi.number()
    .default(10)
    .description(
      'Taille maximale du pool de connexions (nombre de connexions simultanées à maintenir)',
    ),

  MONGODB_REPLICA_SET: Joi.string()
    .optional()
    .description(
      "Nom du replica set MongoDB (si utilisation d'un cluster répliqué)",
    ),

  MONGODB_SSL: Joi.boolean()
    .default(false)
    .description('Active la connexion SSL/TLS vers MongoDB'),

  MONGODB_AUTH_SOURCE: Joi.string()
    .optional()
    .description(
      "Base de données d'authentification (par défaut, celle de l'URI ou 'admin')",
    ),

  MONGODB_RETRY_WRITES: Joi.boolean()
    .default(true)
    .description(
      "Active la réessai automatique des opérations d'écriture en cas d'échec transitoire",
    ),

  MONGODB_READ_PREFERENCE: Joi.string()
    .valid(
      'primary',
      'primaryPreferred',
      'secondary',
      'secondaryPreferred',
      'nearest',
    )
    .default('primary')
    .description(
      'Préférence de lecture pour les requêtes (répartition de la charge entre les membres du replica set)',
    ),
});

/**
 * Interface TypeScript représentant la configuration de la base de données.
 * Utilisée pour le typage dans les services qui consomment cette config.
 */
export interface DatabaseConfig {
  uri: string;
  debug: boolean;
  poolSize: number;
  replicaSet?: string; // Optionnel
  ssl: boolean;
  authSource?: string; // Optionnel
  retryWrites: boolean;
  readPreference: string;
}

/**
 * Enregistre la configuration 'database' sous un espace de noms.
 * Transforme les variables d'environnement brutes en un objet typé.
 * La validation Joi (exécutée en amont) garantira que toutes les variables requises sont présentes.
 */
export default registerAs('database', (): DatabaseConfig => {
  // URI requise : on lit la variable, mais si absente, Joi échouera plus tard
  const uri = process.env.MONGODB_URI ?? '';

  // Conversion de la chaîne en booléen : 'true' (insensible à la casse ? ici on compare exactement 'true')
  const debug = (process.env.MONGODB_DEBUG ?? 'false') === 'true';

  // Conversion en nombre entier, fallback 10 si parseInt échoue
  const poolSize = parseInt(process.env.MONGODB_POOL_SIZE ?? '10', 10) || 10;

  // Optionnel : on laisse undefined si absent
  const replicaSet = process.env.MONGODB_REPLICA_SET; // peut être undefined

  // Booléen SSL
  const ssl = (process.env.MONGODB_SSL ?? 'false') === 'true';

  // Optionnel : base d'auth
  const authSource = process.env.MONGODB_AUTH_SOURCE; // undefined possible

  // Booléen retryWrites : si la variable n'est pas 'false', on considère true
  const retryWrites = (process.env.MONGODB_RETRY_WRITES ?? 'true') !== 'false';

  // Préférence de lecture, fallback 'primary'
  const readPreference = process.env.MONGODB_READ_PREFERENCE ?? 'primary';

  return {
    uri,
    debug,
    poolSize,
    replicaSet,
    ssl,
    authSource,
    retryWrites,
    readPreference,
  };
});
