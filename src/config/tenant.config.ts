import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

/**
 * Schéma de validation pour la configuration du multi-tenant (SaaS).
 *
 * Permet de gérer plusieurs clients (tenants) dans une seule instance d'application.
 * Les modes d'identification du tenant et le niveau d'isolation des données sont configurables.
 */
export const tenantConfigSchema = Joi.object({
  MULTI_TENANT_ENABLED: Joi.boolean()
    .default(false)
    .description('Active le mode multi-tenant (désactivé par défaut)'),

  TENANT_IDENTIFIER: Joi.string()
    .valid('header', 'subdomain', 'jwt')
    .default('header')
    .description(
      "Méthode d'identification du tenant :\n" +
        '- header : via un en-tête HTTP (ex: X-Tenant-ID)\n' +
        '- subdomain : via le sous-domaine de la requête (ex: client1.example.com)\n' +
        '- jwt : via une claim dans le JWT',
    ),

  TENANT_HEADER: Joi.when('TENANT_IDENTIFIER', {
    is: 'header',
    then: Joi.string()
      .default('X-Tenant-ID')
      .description(
        "Nom de l'en-tête HTTP contenant l'identifiant du tenant (utilisé si identifier = 'header')",
      ),
    otherwise: Joi.optional(),
  }),

  TENANT_DB_ISOLATION: Joi.string()
    .valid('database', 'schema', 'collection', 'none')
    .default('none')
    .description(
      "Niveau d'isolation des données entre tenants :\n" +
        '- database : base de données distincte par tenant\n' +
        '- schema : schéma distinct (PostgreSQL) ou base distincte (MongoDB ?) à adapter\n' +
        '- collection : collection distincte (MongoDB) ou table préfixée\n' +
        '- none : toutes les données partagent les mêmes collections (avec un champ tenantId)',
    ),
});

/**
 * Interface de configuration multi-tenant.
 */
export interface TenantConfig {
  enabled: boolean;
  identifier: 'header' | 'subdomain' | 'jwt';
  header?: string; // Utilisé uniquement si identifier = 'header'
  dbIsolation: 'database' | 'schema' | 'collection' | 'none';
}

/**
 * Enregistrement de la configuration 'tenant'.
 *
 * Les valeurs par défaut sont définies pour un fonctionnement standard.
 * Le champ `header` n'est présent que si le mode d'identification est 'header' ;
 * sinon, il peut être absent (undefined).
 */
export default registerAs('tenant', (): TenantConfig => {
  const enabled = (process.env.MULTI_TENANT_ENABLED ?? 'false') === 'true';
  const identifier = (process.env.TENANT_IDENTIFIER ??
    'header') as TenantConfig['identifier'];
  const header = process.env.TENANT_HEADER; // optionnel, sera undefined si identifier != header
  const dbIsolation = (process.env.TENANT_DB_ISOLATION ??
    'none') as TenantConfig['dbIsolation'];

  return {
    enabled,
    identifier,
    header,
    dbIsolation,
  };
});
