import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

/**
 * Schéma de validation pour la configuration de télémétrie (traces distribuées).
 *
 * La télémétrie permet de suivre les requêtes à travers les différents services
 * et d'identifier les goulots d'étranglement. Plusieurs exportateurs sont supportés :
 * - console : affiche les traces dans la console (utile en développement)
 * - otlp : OpenTelemetry Protocol (pour des collecteurs comme Grafana Tempo, Jaeger, etc.)
 * - jaeger : envoi direct à Jaeger
 * - zipkin : envoi direct à Zipkin
 *
 * Le serviceName permet d'identifier cette application dans les traces.
 */
export const telemetryConfigSchema = Joi.object({
  TELEMETRY_ENABLED: Joi.boolean()
    .default(false)
    .description('Active la collecte et l’export des traces distribuées'),

  TELEMETRY_SERVICE_NAME: Joi.string()
    .default('backend-starter')
    .description('Nom du service tel qu’il apparaîtra dans les traces'),

  TELEMETRY_EXPORTER: Joi.string()
    .valid('console', 'otlp', 'jaeger', 'zipkin')
    .default('console')
    .description(
      'Exportateur de traces :\n' +
        '- console : affichage dans la console\n' +
        '- otlp : OpenTelemetry Protocol (collecteur standard)\n' +
        '- jaeger : envoi direct à un agent Jaeger\n' +
        '- zipkin : envoi direct à un serveur Zipkin',
    ),

  // Endpoint pour OTLP (requis si exporter = 'otlp')
  TELEMETRY_OTLP_ENDPOINT: Joi.when('TELEMETRY_EXPORTER', {
    is: 'otlp',
    then: Joi.string()
      .uri()
      .required()
      .description(
        'URL du collecteur OTLP (ex: http://collector:4318/v1/traces)',
      ),
    otherwise: Joi.optional(),
  }),

  // Endpoint pour Jaeger (requis si exporter = 'jaeger')
  TELEMETRY_JAEGER_ENDPOINT: Joi.when('TELEMETRY_EXPORTER', {
    is: 'jaeger',
    then: Joi.string()
      .uri()
      .required()
      .description(
        'URL de l’agent Jaeger (ex: http://jaeger:14268/api/traces)',
      ),
    otherwise: Joi.optional(),
  }),

  // Endpoint pour Zipkin (requis si exporter = 'zipkin')
  TELEMETRY_ZIPKIN_ENDPOINT: Joi.when('TELEMETRY_EXPORTER', {
    is: 'zipkin',
    then: Joi.string()
      .uri()
      .required()
      .description(
        'URL du serveur Zipkin (ex: http://zipkin:9411/api/v2/spans)',
      ),
    otherwise: Joi.optional(),
  }),
});

/**
 * Interface de configuration de la télémétrie.
 *
 * Les endpoints sont optionnels dans l'interface car ils dépendent du choix de l'exportateur,
 * mais la validation Joi garantit qu'ils sont fournis quand nécessaire.
 */
export interface TelemetryConfig {
  enabled: boolean;
  serviceName: string;
  exporter: 'console' | 'otlp' | 'jaeger' | 'zipkin';
  otlpEndpoint?: string;
  jaegerEndpoint?: string;
  zipkinEndpoint?: string;
}

/**
 * Enregistrement de la configuration 'telemetry'.
 *
 * On lit les variables d'environnement avec des valeurs par défaut.
 * Les endpoints ne sont définis que si la variable correspondante est présente ;
 * ils seront ensuite validés par Joi en fonction de l'exportateur choisi.
 */
export default registerAs('telemetry', (): TelemetryConfig => {
  const enabled = (process.env.TELEMETRY_ENABLED ?? 'false') === 'true';
  const serviceName = process.env.TELEMETRY_SERVICE_NAME ?? 'backend-starter';
  const exporter = (process.env.TELEMETRY_EXPORTER ??
    'console') as TelemetryConfig['exporter'];
  const otlpEndpoint = process.env.TELEMETRY_OTLP_ENDPOINT;
  const jaegerEndpoint = process.env.TELEMETRY_JAEGER_ENDPOINT;
  const zipkinEndpoint = process.env.TELEMETRY_ZIPKIN_ENDPOINT;

  return {
    enabled,
    serviceName,
    exporter,
    otlpEndpoint,
    jaegerEndpoint,
    zipkinEndpoint,
  };
});
