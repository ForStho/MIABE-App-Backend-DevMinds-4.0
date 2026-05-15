import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MetricsInterceptor.name);

  constructor(
    @InjectMetric('http_requests_total')
    private requestCounter: Counter<string>,
    @InjectMetric('http_request_duration_seconds')
    private requestDuration: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = request.method as string;
    const route = request.route?.path || request.path || 'unknown';
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - start) / 1000; // en secondes
          try {
            this.requestCounter.inc({ method, route });
            this.requestDuration.observe({ method, route }, duration);
          } catch (error) {
            const err = error as Error;
            this.logger.error(
              `Failed to record metrics: ${err.message}`,
              err.stack,
            );
          }
        },
        error: () => {
          // On pourrait enregistrer les erreurs dans une métrique séparée
          const duration = (Date.now() - start) / 1000;
          try {
            this.requestCounter.inc({ method, route, status: 'error' });
            this.requestDuration.observe({ method, route }, duration);
          } catch (error) {
            const err = error as Error;
            this.logger.error(
              `Failed to record error metrics: ${err.message}`,
              err.stack,
            );
          }
        },
      }),
    );
  }
}
