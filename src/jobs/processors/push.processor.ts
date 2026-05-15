import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger, Injectable } from '@nestjs/common';
import { PushJobData } from '../interfaces/job-data.interface';

/**
 * Interface pour les données de notification push
 */
interface PushNotificationData {
  deviceToken: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/**
 * Service de notification push.
 * À remplacer par un vrai service (Firebase, OneSignal, etc.)
 */
@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  async send(data: PushNotificationData): Promise<void> {
    const { deviceToken, title, body, data: extraData } = data;
    
    this.logger.debug(`Sending push to ${deviceToken}: ${title} - ${body}`);
    
    // Simulation d'envoi (à remplacer par un vrai appel API)
    // await this.firebase.send(...);
    
    // Si erreur, throw pour déclencher un retry
    if (process.env.NODE_ENV === 'test' && deviceToken === 'invalid') {
      throw new Error('Invalid device token');
    }
  }
}

@Processor('notifications')
export class PushProcessor {
  private readonly logger = new Logger(PushProcessor.name);
  
  constructor(private readonly pushService: PushNotificationService) {}

  @Process('push')
  async handlePush(job: Job<PushJobData>): Promise<void> {
    const { id, data } = job;
    this.logger.log(`Processing push job #${id}`);

    try {
      await this.pushService.send(data);
      this.logger.log(`Push job #${id} completed`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Push job #${id} failed: ${err.message}`, err.stack);
      throw error; // Re-lance pour retry
    }
  }
}