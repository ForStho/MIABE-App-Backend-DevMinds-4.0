/**
 * Interface pour les données d’un job d’email.
 */
export interface EmailJobData {
  to: string | string[];
  subject: string;
  template: string; // nom du template
  context: Record<string, any>; // variables pour le template
  attachments?: any[];
}

/**
 * Interface pour les données d’un job de notification push.
 */
export interface PushJobData {
  deviceToken: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * Union des types de jobs possibles (utile pour les processeurs génériques).
 */
export type JobData = EmailJobData | PushJobData;
