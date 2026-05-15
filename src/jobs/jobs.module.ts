// src/jobs/jobs.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Imports des queues
import { NotificationsQueue } from './queues/notifications.queue';

// Imports des processeurs
// import { EmailProcessor } from './processors/email.processor';
import { PushProcessor, PushNotificationService } from './processors/push.processor';

// Imports des cron jobs
// import { CleanupCron } from './cron/cleanup.cron';
import { ReminderCron } from './cron/reminder.cron';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'notifications',
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: configService.get('queue.redis'),
        prefix: configService.get('queue.prefix'),
        defaultJobOptions: configService.get('queue.defaultJobOptions'),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
  ],
  providers: [
    NotificationsQueue,
    PushNotificationService,  // ← Ajouté ici
    PushProcessor,
    ReminderCron,
  ],
  exports: [
    NotificationsQueue,
  ],
})
export class JobsModule {}