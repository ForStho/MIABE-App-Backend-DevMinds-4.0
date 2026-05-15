// src/core/redis/redis.module.ts
import { Module, Global, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { RedisService } from './redis.service';
import { CacheService } from './cache.service';
import { RateLimitStore } from './rate-limit.store';
import { BlacklistService } from './blacklist.service';

import {
  REDIS_CLIENT,
  REDIS_MODULE_OPTIONS,
} from './redis.constants';

import { createRedisClient } from './redis.providers';

@Global()
@Module({})
export class RedisModule {
  static forRoot(): DynamicModule {
    return {
      module: RedisModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: REDIS_MODULE_OPTIONS,
          useValue: {},
        },
        {
          provide: REDIS_CLIENT,
          useFactory: (configService: ConfigService) => {
            return createRedisClient(configService, {});
          },
          inject: [ConfigService],
        },
        RedisService,
        CacheService,
        RateLimitStore,
        BlacklistService,
      ],
      exports: [
        RedisService,
        CacheService,
        RateLimitStore,        // ← Important : on exporte explicitement RateLimitStore
        BlacklistService,
      ],
    };
  }
}