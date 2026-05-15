import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { ConsoleSpanExporter, SpanExporter } from '@opentelemetry/sdk-trace-base';

/**
 * Interface pour la configuration de télémétrie
 */
export interface TelemetryConfig {
  enabled: boolean;
  serviceName: string;
  exporter: 'console' | 'otlp' | 'jaeger' | 'zipkin';
  otlpEndpoint?: string;
  jaegerEndpoint?: string;
  zipkinEndpoint?: string;
}

@Injectable()
export class TelemetryService implements OnModuleInit {
  private readonly logger = new Logger(TelemetryService.name);
  private sdk: NodeSDK | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const telemetryConfig =
      this.configService.get<TelemetryConfig>('telemetry');

    if (!telemetryConfig?.enabled) {
      this.logger.log('Telemetry is disabled');
      return;
    }

    try {
      this.initializeSdk(telemetryConfig);
      this.logger.log(
        `Telemetry initialized with exporter: ${telemetryConfig.exporter}`,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to initialize telemetry: ${err.message}`);
    }
  }

  /**
   * Initialise le SDK OpenTelemetry
   */
  private initializeSdk(config: TelemetryConfig): void {
    const serviceName = config.serviceName || 'backend-starter';

    const traceExporter = this.createExporter(config);

    const resource = resourceFromAttributes({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
        this.configService.get<string>('app.nodeEnv', 'development'),
    });

    this.sdk = new NodeSDK({
      resource,
      traceExporter,
      instrumentations: [getNodeAutoInstrumentations()],
    });

    this.sdk.start();

    this.setupShutdownHandlers();
  }

  /**
   * Crée l'exporteur approprié selon la configuration
   */
  private createExporter(config: TelemetryConfig): SpanExporter {
    switch (config.exporter) {
      case 'otlp':
        if (!config.otlpEndpoint) {
          throw new Error('OTLP endpoint is required when exporter is "otlp"');
        }
        return new OTLPTraceExporter({
          url: config.otlpEndpoint,
        });

      case 'jaeger':
        if (!config.jaegerEndpoint) {
          throw new Error(
            'Jaeger endpoint is required when exporter is "jaeger"',
          );
        }
        return new JaegerExporter({
          endpoint: config.jaegerEndpoint,
        });

      case 'zipkin':
        if (!config.zipkinEndpoint) {
          throw new Error(
            'Zipkin endpoint is required when exporter is "zipkin"',
          );
        }
        return new ZipkinExporter({
          url: config.zipkinEndpoint,
        });

      case 'console':
      default:
        return new ConsoleSpanExporter();
    }
  }

  /**
   * Configure les handlers pour l'arrêt propre du SDK
   */
  private setupShutdownHandlers(): void {
    const shutdown = async (): Promise<void> => {
      if (!this.sdk) return;

      try {
        await this.sdk.shutdown();
        this.logger.log('Telemetry SDK shut down successfully');
      } catch (error) {
        const err = error as Error;
        this.logger.error(
          'Error shutting down telemetry SDK',
          err.stack,
        );
      }
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    process.on('beforeExit', shutdown);
  }

  /**
   * Arrête manuellement le SDK (utile pour les tests)
   */
  async shutdown(): Promise<void> {
    if (!this.sdk) return;

    await this.sdk.shutdown();
    this.sdk = null;
  }
}