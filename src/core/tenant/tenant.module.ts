import {
  Module,
  DynamicModule,
  Global,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TenantMiddleware } from './tenant.middleware';
import { TenantService } from './tenant.service';
import { TenantGuard } from './tenant.guard';

@Global()
@Module({})
export class TenantModule implements NestModule {
  static forRoot(): DynamicModule {
    return {
      module: TenantModule,
      providers: [
        TenantService,
        {
          provide: APP_GUARD,
          useClass: TenantGuard,
        },
      ],
      exports: [TenantService],
    };
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}