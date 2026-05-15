import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

/**
 * Schéma de validation Joi pour la configuration du service d'envoi d'emails (SMTP).
 *
 * Tous les champs sont marqués comme requis car l'envoi d'emails est une fonctionnalité critique
 * de l'application (notifications, validation de comptes, etc.). Si une variable est manquante,
 * l'application ne démarrera pas, ce qui est le comportement souhaité en production pour éviter
 * des échecs silencieux.
 *
 * Les valeurs par défaut (port 587, secure false) sont choisies pour être compatibles avec la
 * plupart des serveurs SMTP modernes utilisant STARTTLS.
 */
export const mailConfigSchema = Joi.object({
  MAIL_HOST: Joi.string()
    .required()
    .description(
      'Hôte du serveur SMTP (ex: smtp.gmail.com, smtp.sendgrid.net)',
    ),

  MAIL_PORT: Joi.number()
    .default(587)
    .description('Port du serveur SMTP (587 pour STARTTLS, 465 pour SSL)'),

  MAIL_USER: Joi.string()
    .required()
    .description(
      "Nom d'utilisateur pour l'authentification SMTP (souvent l'adresse email complète)",
    ),

  MAIL_PASSWORD: Joi.string()
    .required()
    .description('Mot de passe SMTP (ou token API) - à garder secret'),

  MAIL_FROM: Joi.string()
    .email()
    .required()
    .description(
      "Adresse email utilisée par défaut dans le champ 'From' des emails envoyés",
    ),

  MAIL_SECURE: Joi.boolean()
    .default(false)
    .description(
      'Sécuriser la connexion : true = SSL (port 465), false = STARTTLS (port 587). ' +
        'Généralement false pour utiliser STARTTLS sur le port 587.',
    ),
});

/**
 * Interface TypeScript pour la configuration mail.
 * Toutes les propriétés sont requises, car le module de messagerie suppose leur présence.
 * Les valeurs par défaut définies dans le `registerAs` garantissent que l'objet retourné
 * respecte cette interface, même si les variables d'environnement sont absentes (la validation
 * Joi ultérieure échouera si des champs requis manquent).
 */
export interface MailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  secure: boolean;
}

/**
 * Enregistre la configuration 'mail' sous un espace de noms.
 *
 * Cette fonction lit les variables d'environnement et applique des valeurs par défaut
 * pour garantir la stabilité. Elle transforme également les types (ex: string en number, boolean).
 *
 * Note importante : les valeurs par défaut (chaînes vides, 587, false) ne sont pas destinées
 * à être utilisées en production ; elles servent uniquement à éviter des erreurs TypeScript.
 * La validation Joi exécutée au démarrage (via `ConfigModule.forRoot()`) signalera toute
 * variable requise manquante.
 */
export default registerAs('mail', (): MailConfig => {
  // Hôte SMTP : si absent, chaîne vide (provoquera une erreur de validation Joi)
  const host = process.env.MAIL_HOST ?? '';

  // Port : conversion en nombre, avec fallback 587 si absent ou NaN
  const port = parseInt(process.env.MAIL_PORT ?? '587', 10) || 587;

  // Utilisateur SMTP : chaîne vide si absent
  const user = process.env.MAIL_USER ?? '';

  // Mot de passe : chaîne vide si absent
  const password = process.env.MAIL_PASSWORD ?? '';

  // Adresse d'expédition : chaîne vide si absente
  const from = process.env.MAIL_FROM ?? '';

  // Mode sécurisé : conversion de 'true' (insensible à la casse) en booléen ; défaut false
  const secure = (process.env.MAIL_SECURE ?? 'false') === 'true';

  return {
    host,
    port,
    user,
    password,
    from,
    secure,
  };
});
