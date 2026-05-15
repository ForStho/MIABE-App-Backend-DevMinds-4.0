import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

/**
 * Schéma de validation Joi pour la configuration des logs d'activité.
 *
 * Les logs d'activité enregistrent les actions importantes des utilisateurs
 * (connexions, modifications, suppression, etc.) à des fins d'audit et de conformité.
 * La rétention détermine combien de temps ces logs sont conservés avant d'être
 * purgés automatiquement.
 *
 * La valeur par défaut de 90 jours est un compromis courant entre les exigences
 * de conformité (souvent 1 an pour certaines réglementations) et les coûts de stockage.
 * Elle peut être ajustée selon les besoins métier ou légaux.
 */
export const activityLogsConfigSchema = Joi.object({
  ACTIVITY_LOGS_RETENTION_DAYS: Joi.number()
    .min(1) // Au moins 1 jour de rétention
    .max(3650) // Maximum 10 ans (raisonnable)
    .default(90)
    .description(
      'Durée de rétention des logs d’activité en jours (entre 1 et 3650)',
    ),
});

/**
 * Interface décrivant la structure de la configuration des logs d'activité.
 * Utilisée pour le typage fort lors de l'injection avec `ConfigService`.
 *
 * @example
 * // Dans un service
 * constructor(private configService: ConfigService) {
 *   const retention = this.configService.get<ActivityLogsConfig>('activityLogs').retentionDays;
 * }
 */
export interface ActivityLogsConfig {
  retentionDays: number;
}

/**
 * Enregistre la configuration 'activityLogs' sous un espace de noms.
 *
 * La fonction lit la variable d'environnement `ACTIVITY_LOGS_RETENTION_DAYS`,
 * applique une valeur par défaut de 90 jours, et s'assure que le résultat est un nombre.
 *
 * Bien que Joi fournisse également une valeur par défaut, nous appliquons ici une
 * double sécurité : si la variable est absente ou si le parsing échoue, on retombe
 * sur 90. Cela garantit que le service d'audit dispose toujours d'une valeur cohérente.
 *
 * @returns Un objet contenant la durée de rétention en jours.
 */
export default registerAs('activityLogs', (): ActivityLogsConfig => {
  // Lecture de la variable d'environnement, avec fallback '90'
  const retentionDaysEnv = process.env.ACTIVITY_LOGS_RETENTION_DAYS ?? '90';

  // Conversion en nombre ; si le résultat est NaN, on utilise 90
  const retentionDays = parseInt(retentionDaysEnv, 10) || 90;

  return {
    retentionDays,
  };
});
