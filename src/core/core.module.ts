/**
 * CoreModule
 *
 * Module central de l'infrastructure backend.
 * Il permet d'activer ou désactiver dynamiquement différents sous-modules
 * en fonction des besoins de l'application.
 *
 * Ce module est déclaré global afin que les services exposés soient
 * accessibles dans toute l'application sans devoir réimporter les modules.
 */

import {
  Global,
  Module,
  DynamicModule,
  Type,
  ForwardReference,
} from '@nestjs/common';

// Imports des sous-modules
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { LoggerModule } from './logger/logger.module';
import { EventsModule } from './events/events.module';
import { HealthModule } from './health/health.module';
import { QueueModule } from './queue/queue.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { MetricsModule } from './metrics/metrics.module';
import { TenantModule } from './tenant/tenant.module';
import { IdempotencyModule } from './idempotency/idempotency.module';
import { FeatureFlagsModule } from './feature-flags/feature-flags.module';
import { ResilienceModule } from './resilience/resilience.module';
import { SecurityModule } from './security/security.module';

/**
 * Type accepté par la propriété "imports" de NestJS
 *
 * NestJS accepte les Promise<DynamicModule> dans imports
 * car certains modules peuvent être chargés de manière asynchrone.
 */
type ModuleImport =
  | Type<any>
  | DynamicModule
  | Promise<DynamicModule>
  | ForwardReference;

/**
 * Type accepté par la propriété "exports"
 *
 * Contrairement à imports, exports N'ACCEPTE PAS
 * Promise<DynamicModule>.
 */
type ModuleExport =
  | DynamicModule
  | string
  | symbol
  | ForwardReference
  | Function;

/**
 * Options de configuration du CoreModule
 *
 * Permet d'activer ou désactiver certains modules
 * afin d'adapter l'infrastructure aux besoins
 * de chaque application.
 */
export interface CoreModuleOptions {
  enableDatabase?: boolean;
  enableRedis?: boolean;
  enableLogger?: boolean;
  enableEvents?: boolean;
  enableHealth?: boolean;
  enableQueue?: boolean;
  enableTelemetry?: boolean;
  enableMetrics?: boolean;
  enableTenant?: boolean;
  enableIdempotency?: boolean;
  enableFeatureFlags?: boolean;
  enableResilience?: boolean;
  enableSecurity?: boolean;
  enableGeolocation?: boolean;

}

@Global()
@Module({})
export class CoreModule {
  /**
   * Méthode d'initialisation dynamique du CoreModule.
   *
   * Elle permet d'activer ou désactiver les modules
   * via des feature flags.
   *
   * Exemple :
   *
   * CoreModule.forRoot({
   *   enableTelemetry: true,
   *   enableMetrics: true
   * })
   */
  static forRoot(options: CoreModuleOptions = {}): DynamicModule {
    /**
     * Valeurs par défaut
     * Si une option n'est pas fournie,
     * on active le module par défaut.
     */
    const enableDatabase = options.enableDatabase ?? true;
    const enableRedis = options.enableRedis ?? false; // Redis est désactivé par défaut car il n'est pas nécessaire pour toutes les applications
    const enableLogger = options.enableLogger ?? true;
    const enableEvents = options.enableEvents ?? true;
    const enableHealth = options.enableHealth ?? true;
    const enableQueue = options.enableQueue ?? true;
    const enableTelemetry = options.enableTelemetry ?? false;
    const enableMetrics = options.enableMetrics ?? false;
    const enableTenant = options.enableTenant ?? false;
    const enableIdempotency = options.enableIdempotency ?? true;
    const enableFeatureFlags = options.enableFeatureFlags ?? true;
    const enableResilience = options.enableResilience ?? true;
    const enableSecurity = options.enableSecurity ?? true;
    const enableGeolocation = options.enableGeolocation ?? true;

    /**
     * Tableaux contenant les modules
     * à importer et exporter.
     */
    const imports: ModuleImport[] = [];
    const exports: ModuleExport[] = [];

    /**
     * Activation conditionnelle des modules
     */

    if (enableDatabase) {
      const module = DatabaseModule.forRoot();
      console.log('📦 Database module loaded:', module.module.name); // Pour debug
      imports.push(module);
      exports.push(module);
    }

    if (enableRedis) {
      const module = RedisModule.forRoot();
      console.log('📦 Redis module loaded:', module.module.name);
      imports.push(module);
      exports.push(module);
    }

    if (enableLogger) {
      const module = LoggerModule.forRoot();
      console.log('📦 Logger module loaded:', module.module.name);
      imports.push(module);
      exports.push(module);
    }

    if (enableEvents) {
      const module = EventsModule.forRoot();
      console.log('📦 Events module loaded:', module.module.name);
      imports.push(module);
      exports.push(module);
    }

    if (enableHealth) {
      const module = HealthModule.forRoot();
      console.log('📦 Health module loaded:', module.module.name);
      imports.push(module);
      exports.push(module);
    }

    if (enableQueue) {
      const module = QueueModule.forRoot();
      console.log('📦 Queue module loaded:', module.module.name);
      imports.push(module);
      exports.push(module);
    }

    if (enableTelemetry) {
      const module = TelemetryModule.forRoot();
      console.log('📦 Telemetry module loaded:', module.module.name);
      imports.push(module);
      exports.push(module);
    }

    if (enableMetrics) {
      const module = MetricsModule.forRoot();
      console.log('📦 Metrics module loaded:', module.module.name);
      imports.push(module);
      exports.push(module);
    }

    if (enableTenant) {
      const module = TenantModule.forRoot();
      console.log('📦 Tenant module loaded:', module.module.name);
      imports.push(module);
      exports.push(module);
    }

    if (enableIdempotency) {
      const module = IdempotencyModule.forRoot();
      console.log('📦 Idempotency module loaded:', module.module.name);
      imports.push(module);
      exports.push(module);
    }

    if (enableFeatureFlags) {
      const module = FeatureFlagsModule.forRoot();
      console.log('📦 Feature Flags module loaded:', module.module.name);
      imports.push(module);
      exports.push(module);
    }

    if (enableResilience) {
      const module = ResilienceModule.forRoot();
      console.log('📦 Resilience module loaded:', module.module.name);
      imports.push(module);
      exports.push(module);
    }

    if (enableSecurity) {
      const module = SecurityModule.forRoot();
      console.log('📦 Security module loaded:', module.module.name);
      imports.push(module);
      exports.push(module);
    }

    /**
     * Module dynamique retourné
     */
    return {
      module: CoreModule,
      imports,
      exports,
    };
  }
}