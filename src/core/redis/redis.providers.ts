// backend/src/core/redis/redis.providers.ts

import { ConfigService } from '@nestjs/config';
import Redis, { Cluster } from 'ioredis';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  tls?: boolean;
  clusterEnabled?: boolean;
  clusterNodes?: string[];
  sentinelEnabled?: boolean;
  sentinelNodes?: string[];
  sentinelMasterName?: string;
}


export function createRedisClient(
  configService: ConfigService,
  options: any,
): Redis | Cluster {
  const redisConfig =
    options.config || configService.get<RedisConfig>('redis');

  /**
   * Mode Redis Cluster
   */
  if (redisConfig?.clusterEnabled && redisConfig.clusterNodes) {
    const nodes = redisConfig.clusterNodes.map((node: string) => {
      const [host, port] = node.split(':');
      return {
        host,
        port: parseInt(port, 10),
      };
    });

    return new Cluster(nodes, {
      redisOptions: {
        password: redisConfig.password,
        tls: redisConfig.tls ? {} : undefined,
      },
    });
  }

  /**
   * Mode Redis Sentinel
   */
  if (
    redisConfig?.sentinelEnabled &&
    redisConfig.sentinelNodes &&
    redisConfig.sentinelMasterName
  ) {
    const sentinels = redisConfig.sentinelNodes.map((node: string) => {
      const [host, port] = node.split(':');

      return {
        host,
        port: parseInt(port, 10),
      };
    });

    return new Redis({
      sentinels,
      name: redisConfig.sentinelMasterName,
      password: redisConfig.password,
      db: redisConfig.db,
      tls: redisConfig.tls ? {} : undefined,
    });
  }

  /**
   * Mode Redis Standard
   */
  return new Redis({
    host: redisConfig?.host,
    port: redisConfig?.port,
    password: redisConfig?.password,
    db: redisConfig?.db,
    tls: redisConfig?.tls ? {} : undefined,
  });
}