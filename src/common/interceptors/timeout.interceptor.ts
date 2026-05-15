import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';

/**
 * Intercepteur qui applique un timeout global sur toutes les requêtes.
 * Si une requête dépasse la durée spécifiée, une erreur 408 est renvoyée.
 * La durée peut être configurée via la configuration (resilience.timeout.default).
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const timeoutMs = this.configService.get(
      'resilience.timeout.default',
      10000,
    );
    return next.handle().pipe(
      timeout(timeoutMs),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () => new RequestTimeoutException('Request timeout'),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
