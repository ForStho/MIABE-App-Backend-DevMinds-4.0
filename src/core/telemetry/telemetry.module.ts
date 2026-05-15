import {
  Module,
  DynamicModule,
  Global,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelemetryService } from './telemetry.service';
import { TelemetryMiddleware } from './telemetry.middleware';

@Global()
@Module({})
export class TelemetryModule implements NestModule {
  static forRoot(): DynamicModule {
    return {
      module: TelemetryModule,
      imports: [ConfigModule],
      providers: [TelemetryService],
      exports: [TelemetryService],
    };
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TelemetryMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });

  }
}
