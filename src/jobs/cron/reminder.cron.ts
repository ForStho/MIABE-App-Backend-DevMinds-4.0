import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsQueue } from '../queues/notifications.queue';

/**
 * Tâche cron pour envoyer des rappels quotidiens aux utilisateurs.
 * Elle ajoute des jobs dans la queue 'notifications' pour chaque utilisateur concerné.
 */
@Injectable()
export class ReminderCron {
  private readonly logger = new Logger(ReminderCron.name);

  constructor(private readonly notificationsQueue: NotificationsQueue) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleReminders() {
    this.logger.log('Starting daily reminder job');

    // Exemple : récupérer les utilisateurs devant recevoir un rappel
    const users = await this.getUsersForReminder();

    for (const user of users) {
      await this.notificationsQueue.addEmailJob({
        to: user.email,
        subject: 'Daily reminder',
        template: 'reminder',
        context: { name: user.name },
      });
    }

    this.logger.log(`Queued ${users.length} reminder emails`);
  }

  private async getUsersForReminder(): Promise<any[]> {
    // Logique pour récupérer les utilisateurs
    return []; // à implémenter
  }
}
