// src/core/metrics/metrics.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Counter, Histogram, Registry } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(
    @InjectMetric('http_requests_total') private requestCounter: Counter<string>,
    @InjectMetric('http_request_duration_seconds') private requestDuration: Histogram<string>,
  ) {}

  /**
   * Incrémente le compteur de requêtes HTTP.
   */
  incrementHttpRequestCount(method: string, route: string, status?: string): void {
    try {
      const labels: Record<string, string> = { method, route };
      if (status) {
        labels.status = status;
      }
      this.requestCounter.inc(labels);
    } catch (error) {
      this.logger.error(`Failed to increment request count: ${(error as Error).message}`);
    }
  }

  /**
   * Enregistre la durée d'une requête HTTP.
   */
  observeHttpRequestDuration(method: string, route: string, durationSeconds: number): void {
    try {
      this.requestDuration.observe({ method, route }, durationSeconds);
    } catch (error) {
      this.logger.error(`Failed to observe request duration: ${(error as Error).message}`);
    }
  }
}