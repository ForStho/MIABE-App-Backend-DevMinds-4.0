import { Module, DynamicModule, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MetricsInterceptor } from './metrics.interceptor';
import { MetricsService } from './metrics.service';
import { MetricsConfig } from '../../config/metrics.config'; // Interface de configuration typée

/**
 * Interface pour les options de configuration du module Prometheus.
 * Cette interface permet de typer correctement la fonction useFactory.
 */
interface PrometheusModuleOptions {
  defaultMetrics: {
    enabled: boolean;
  };
  path: string;
  defaultLabels: {
    app: string;
    [key: string]: string; // Permet d'ajouter d'autres labels si nécessaire
  };
}

@Global()
@Module({})
export class MetricsModule {
  /**
   * Initialise le module de métriques de manière asynchrone.
   * Utilise ConfigService pour récupérer la configuration depuis les variables d'environnement.
   * 
   * @returns DynamicModule - Module configuré dynamiquement
   */
  static forRoot(): DynamicModule {
    return {
      module: MetricsModule,
      imports: [
        PrometheusModule.registerAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService): PrometheusModuleOptions => {
            // Récupération de la configuration typée
            const metricsConfig = configService.get<MetricsConfig>('metrics');
            
            // Valeurs par défaut sécurisées
            const isEnabled = metricsConfig?.enabled ?? false;
            const endpoint = metricsConfig?.endpoint ?? '/metrics';
            const prefix = metricsConfig?.prefix ?? 'app_';

            return {
              defaultMetrics: {
                enabled: isEnabled,
              },
              path: endpoint,
              defaultLabels: {
                app: 'backend-starter',
                environment: configService.get<string>('app.nodeEnv', 'development'),
                version: process.env.npm_package_version ?? 'unknown',
              },
            };
          },
          inject: [ConfigService],
        }),
      ],
      providers: [
        MetricsService,
        {
          provide: APP_INTERCEPTOR,
          useClass: MetricsInterceptor,
        },
      ],
      exports: [MetricsService],
    };
  }
}