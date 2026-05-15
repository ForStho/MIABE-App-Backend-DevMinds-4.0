import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

/**
 * Schéma de validation pour la configuration JWT (JSON Web Tokens).
 * Gère les secrets, durées de validité, et options d'émission.
 */
export const jwtConfigSchema = Joi.object({
  JWT_SECRET: Joi.string()
    .required()
    .description(
      "Secret utilisé pour signer les tokens d'accès (access tokens)",
    ),

  JWT_EXPIRES_IN: Joi.string()
    .default('15m')
    .description('Durée de validité des access tokens (ex: 15m, 7d, 2h)'),

  JWT_REFRESH_SECRET: Joi.string()
    .required()
    .description(
      "Secret utilisé pour signer les refresh tokens (doit être différent du secret d'accès)",
    ),

  JWT_REFRESH_EXPIRES_IN: Joi.string()
    .default('7d')
    .description(
      'Durée de validité des refresh tokens (généralement plus longue)',
    ),

  JWT_ISSUER: Joi.string()
    .optional()
    .description(
      'Émetteur du token (iss claim) - optionnel, mais recommandé pour la sécurité',
    ),

  JWT_AUDIENCE: Joi.string()
    .optional()
    .description(
      "Audience du token (aud claim) - permet de restreindre l'utilisation à certaines parties",
    ),
});

/**
 * Interface de la configuration JWT.
 */
export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
  issuer?: string; // Optionnel
  audience?: string; // Optionnel
}

/**
 * Enregistrement de la configuration JWT.
 * Les secrets sont obligatoires et seront validés par Joi.
 */
export default registerAs('jwt', (): JwtConfig => {
  // Secret d'accès (obligatoire)
  const secret = process.env.JWT_SECRET ?? '';

  // Durée de vie des access tokens (défaut 15 minutes)
  const expiresIn = process.env.JWT_EXPIRES_IN ?? '15m';

  // Secret de refresh (obligatoire, distinct du précédent pour des raisons de sécurité)
  const refreshSecret = process.env.JWT_REFRESH_SECRET ?? '';

  // Durée de vie des refresh tokens (défaut 7 jours)
  const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

  // Issuer et audience sont optionnels
  const issuer = process.env.JWT_ISSUER;
  const audience = process.env.JWT_AUDIENCE;

  return {
    secret,
    expiresIn,
    refreshSecret,
    refreshExpiresIn,
    issuer,
    audience,
  };
});
