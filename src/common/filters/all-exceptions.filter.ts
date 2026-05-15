import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Interface pour la réponse d'erreur standardisée.
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
  timestamp: string;
  path: string;
  statusCode: number;
}

/**
 * Filtre global capturant toutes les exceptions non gérées.
 *
 * Ce filtre garantit que toutes les erreurs sont transformées en une réponse JSON cohérente.
 * En production, les détails de l'erreur (stack, message interne) sont masqués pour des raisons de sécurité.
 *
 * @example
 * // Enregistrement global dans main.ts
 * app.useGlobalFilters(new AllExceptionsFilter());
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  /**
   * Méthode appelée automatiquement lorsqu'une exception est levée.
   *
   * @param exception - L'exception capturée (type inconnu à ce stade).
   * @param host - Contexte d'exécution (HTTP, RPC, etc.).
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    // Construction d'un message de log sécurisé
    let logMessage: string;
    let clientMessage: string;
    const errorCode = 'INTERNAL_ERROR';

    if (exception instanceof Error) {
      // C'est une erreur standard : on peut récupérer le message et la stack
      logMessage = `${request.method} ${request.url} - ${exception.message}\n${exception.stack}`;
      clientMessage = exception.message;
    } else if (typeof exception === 'string') {
      // Exception sous forme de string simple
      logMessage = `${request.method} ${request.url} - ${exception}`;
      clientMessage = exception;
    } else {
      // Autre type (objet, null, etc.) : on le stringifie pour le log
      logMessage = `${request.method} ${request.url} - ${JSON.stringify(exception)}`;
      clientMessage = 'Internal server error';
    }

    // Enregistrement de l'erreur dans les logs
    this.logger.error(logMessage);

    // En production, on ne renvoie pas le message détaillé au client
    const isProduction = process.env.NODE_ENV === 'production';
    const message = isProduction ? 'Internal server error' : clientMessage;

    // Construction de la réponse
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: errorCode,
        message,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
      statusCode: status,
    };

    response.status(status).json(errorResponse);
  }
}
