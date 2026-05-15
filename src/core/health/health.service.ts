import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';

export interface HealthCheckResult {
  status: 'up' | 'down';
  details?: string;
}

export interface HealthCheckResponse {
  mongodb: HealthCheckResult;
  redis: HealthCheckResult;
  timestamp: string;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
  ) {}

  checkMongo(): HealthCheckResult {
    try {
      const isConnected = this.databaseService.isConnected();

      return {
        status: isConnected ? 'up' : 'down',
        details: isConnected ? undefined : 'Not connected to MongoDB',
      };
    } catch (error: unknown) {
      const err = error as Error;

      this.logger.error(
        `MongoDB health check failed: ${err.message}`,
        err.stack,
      );

      return { status: 'down', details: err.message };
    }
  }

  async checkRedis(): Promise<HealthCheckResult> {
    try {
      const client = this.redisService.getClient();
      const pingResult = await client.ping();

      const isUp = pingResult === 'PONG';

      return {
        status: isUp ? 'up' : 'down',
        details: isUp ? undefined : 'Redis ping did not return PONG',
      };
    } catch (error: unknown) {
      const err = error as Error;

      this.logger.error(`Redis health check failed: ${err.message}`, err.stack);

      return { status: 'down', details: err.message };
    }
  }

  async checkAll(): Promise<HealthCheckResponse> {
    const [mongo, redis] = await Promise.all([
      Promise.resolve(this.checkMongo()),
      this.checkRedis(),
    ]);

    return {
      mongodb: mongo,
      redis,
      timestamp: new Date().toISOString(),
    };
  }
}
