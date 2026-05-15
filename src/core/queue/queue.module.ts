import { Module, DynamicModule, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';

@Global()
@Module({})
export class QueueModule {
  static forRoot(): DynamicModule {
    return {
      module: QueueModule,
      imports: [
        BullModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => {
            const queueConfig = configService.get('queue');
            return {
              redis: queueConfig.redis,
              prefix: queueConfig.prefix,
              defaultJobOptions: queueConfig.defaultJobOptions,
            };
          },
          inject: [ConfigService],
        }),
        // On peut pré-enregistrer des queues ici, ou les laisser être enregistrées dynamiquement
        BullModule.registerQueue({ name: 'email' }, { name: 'notification' }),
      ],
      providers: [QueueService],
      exports: [QueueService, BullModule], // Exporte BullModule pour que les modules puissent injecter des queues spécifiques
    };
  }
}
