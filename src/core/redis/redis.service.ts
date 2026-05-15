import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Cluster, RedisOptions, ClusterNode } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | Cluster;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const config = this.configService.get('redis');
    const options: RedisOptions = {
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db || 0,
      retryStrategy: (times) => {
        // Exponential backoff: 50ms, 100ms, 200ms, ... max 2s
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
      ...(config.tls ? { tls: {} } : {}),
    };

    if (config.clusterEnabled) {
      // Mode cluster
      const nodes: ClusterNode[] = config.clusterNodes.map((node: string) => {
        const [host, port] = node.split(':');
        return { host, port: parseInt(port, 10) };
      });
      this.client = new Redis.Cluster(nodes, {
        redisOptions: options,
        clusterRetryStrategy: options.retryStrategy,
      });
      this.logger.log('Redis Cluster initialized');
    } else if (config.sentinelEnabled) {
      // Mode sentinel
      const sentinels = config.sentinelNodes.map((node: string) => {
        const [host, port] = node.split(':');
        return { host, port: parseInt(port, 10) };
      });
      this.client = new Redis({
        sentinels,
        name: config.sentinelMasterName,
        ...options,
      });
      this.logger.log('Redis Sentinel initialized');
    } else {
      // Mode standalone
      this.client = new Redis(options);
      this.logger.log('Redis standalone initialized');
    }

    // Écouteurs d'événements
    this.client.on('connect', () => this.logger.log('Redis connecting...'));
    this.client.on('ready', () => this.logger.log('Redis ready'));
    this.client.on('error', (err) =>
      this.logger.error(`Redis error: ${err.message}`, err.stack),
    );
    this.client.on('close', () => this.logger.warn('Redis connection closed'));
    this.client.on('reconnecting', (delay) =>
      this.logger.log(`Redis reconnecting in ${delay}ms`),
    );
  }

  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('Redis connection closed gracefully');
  }

  /**
   * Retourne le client Redis brut (pour opérations avancées).
   */
  getClient(): Redis | Cluster {
    return this.client;
  }

  // Méthodes génériques
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.set(key, value, 'EX', ttl);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  /**
   * Exécute un script Lua (pour atomicité).
   */
  async eval(script: string, keys: string[], args: any[]): Promise<any> {
    return this.client.eval(script, keys.length, ...keys, ...args);
  }
}
