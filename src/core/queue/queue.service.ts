import { Injectable, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue, JobOptions, Job } from 'bull';

/**
 * Interface pour les données d'un job d'email
 */
export interface EmailJobData {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, unknown>;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
  }>;
}

/**
 * Interface pour les données d'un job de notification push
 */
export interface PushJobData {
  deviceTokens: string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/**
 * Type union pour tous les types de jobs supportés
 */
export type JobData = EmailJobData | PushJobData | Record<string, unknown>;

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}

  /**
   * Ajoute un job d'email.
   * @param data Contenu de l'email (to, subject, template, context)
   * @param options Options Bull (delay, attempts, etc.)
   * @returns Le job créé
   */
  async addEmailJob(data: EmailJobData, options?: JobOptions): Promise<Job<EmailJobData>> {
    return this.emailQueue.add('send', data, options);
  }

  /**
   * Ajoute un job de notification push.
   * @param data Données de la notification
   * @param options Options Bull
   * @returns Le job créé
   */
  async addPushJob(data: PushJobData, options?: JobOptions): Promise<Job<PushJobData>> {
    return this.notificationQueue.add('push', data, options);
  }

  /**
   * Ajoute un job générique sur une queue nommée.
   * @param queueName Nom de la queue ('email' ou 'notification')
   * @param jobName Nom du job ('send', 'push', etc.)
   * @param data Données du job
   * @param options Options Bull
   * @returns Le job créé
   * @throws Error si la queue n'existe pas
   */
  async addJob(
    queueName: string,
    jobName: string,
    data: JobData,
    options?: JobOptions,
  ): Promise<Job> {
    const queue = this.getQueueByName(queueName);
    return queue.add(jobName, data, options);
  }

  /**
   * Retourne une queue Bull par son nom.
   * @param name Nom de la queue ('email' ou 'notification')
   * @returns L'instance de la queue
   * @throws Error si la queue n'est pas enregistrée
   */
  getQueue(name: string): Queue {
    return this.getQueueByName(name);
  }

  /**
   * Méthode interne pour obtenir une queue par son nom avec typage
   */
  private getQueueByName(name: string): Queue {
    switch (name) {
      case 'email':
        return this.emailQueue;
      case 'notification':
        return this.notificationQueue;
      default:
        throw new Error(`Queue ${name} not registered. Available queues: email, notification`);
    }
  }
}