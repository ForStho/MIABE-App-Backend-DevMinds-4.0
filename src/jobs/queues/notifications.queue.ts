import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue, Job, JobOptions } from 'bull';
import { EmailJobData, PushJobData } from '../interfaces/job-data.interface';

/**
 * Type union pour tous les types de données de job possibles
 */
type NotificationJobData = EmailJobData | PushJobData;

/**
 * Service d’abstraction pour la queue 'notifications'.
 * Fournit des méthodes typées pour ajouter des jobs d’email ou de push.
 * Les modules métier peuvent injecter ce service pour planifier des notifications.
 */
@Injectable()
export class NotificationsQueue {
  constructor(
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
  ) {}

  /**
   * Ajoute un job d’email.
   * @param data Données de l’email
   * @param options Options Bull (delay, attempts, etc.)
   * @returns Le job créé
   */
  async addEmailJob(data: EmailJobData, options?: JobOptions): Promise<Job<EmailJobData>> {
    return this.notificationsQueue.add('email', data, options);
  }

  /**
   * Ajoute un job de notification push.
   * @param data Données push
   * @param options Options Bull
   */
  async addPushJob(data: PushJobData, options?: JobOptions): Promise<Job<PushJobData>> {
    return this.notificationsQueue.add('push', data, options);
  }

  /**
   * Méthode générique pour ajouter n’importe quel type de job (si nécessaire).
   */
  async addJob(jobName: string, data: NotificationJobData, options?: JobOptions): Promise<Job<NotificationJobData>> {
    return this.notificationsQueue.add(jobName, data, options);
  }

  /**
   * Récupère un job par son ID.
   * @param jobId ID du job
   */
  async getJob(jobId: string): Promise<Job<NotificationJobData> | null> {
    return this.notificationsQueue.getJob(jobId);
  }

  /**
   * Supprime un job.
   * @param jobId ID du job
   */
  async removeJob(jobId: string): Promise<void> {
    const job = await this.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }
}