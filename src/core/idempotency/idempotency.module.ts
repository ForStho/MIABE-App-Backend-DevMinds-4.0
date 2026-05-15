import {
  Module,
  DynamicModule,
  Global,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { IdempotencyMiddleware } from './idempotency.middleware';
import { IdempotencyService } from './idempotency.service';

@Global()
@Module({})
export class IdempotencyModule implements NestModule {
  static forRoot(): DynamicModule {
    return {
      module: IdempotencyModule,
      providers: [IdempotencyService],
      exports: [IdempotencyService],
    };
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IdempotencyMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });

  }
}
