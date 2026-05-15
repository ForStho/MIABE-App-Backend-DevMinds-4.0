import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interface standardisée pour toutes les réponses API.
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  path: string;
  statusCode: number;
  message?: string;
}

/**
 * Intercepteur qui transforme toutes les réponses en un format uniforme.
 * Ajoute un champ 'success' à true, un timestamp, et le chemin de la requête.
 *
 * Exemple de sortie :
 * {
 *   "success": true,
 *   "data": { ... },
 *   "timestamp": "2025-01-01T00:00:00.000Z",
 *   "path": "/users",
 *   "statusCode": 200
 * }
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
        statusCode,
      })),
    );
  }
}
