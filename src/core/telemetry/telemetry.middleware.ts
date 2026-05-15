import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { trace, context } from '@opentelemetry/api';
import { TRACE_ID_HEADER } from './telemetry.constants';

@Injectable()
export class TelemetryMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tracer = trace.getTracer('default');
    const span = tracer.startSpan(
      `${req.method} ${req.route?.path || req.path}`,
    );
    context.with(trace.setSpan(context.active(), span), () => {
      // Injecte le traceId dans les en-têtes de réponse (optionnel)
      const traceId = span.spanContext().traceId;
      res.setHeader(TRACE_ID_HEADER, traceId);
      next();
    });
    span.end();
  }
}
