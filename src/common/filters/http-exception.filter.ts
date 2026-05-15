import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Interface décrivant la structure possible de la réponse d'une HttpException.
 * NestJS peut retourner une string ou un objet avec message, error, statusCode, etc.
 */
interface HttpExceptionResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
  details?: unknown; // Champ personnalisé que nous pourrions ajouter
  code?: string; // Code métier optionnel
}

/**
 * Type union : la réponse peut être une string ou un objet.
 */
type ExceptionResponse = string | HttpExceptionResponse;

/**
 * Interface pour la réponse d'erreur standardisée.
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
  path: string;
  statusCode: number;
}

/**
 * Filtre spécifique aux HttpException.
 *
 * Ce filtre formate toutes les exceptions HTTP selon une structure standardisée.
 * Il extrait le message, le code d'erreur et d'éventuels détails.
 *
 * @example
 * // Enregistrement global (ou spécifique) dans main.ts
 * app.useGlobalFilters(new HttpExceptionFilter());
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * Méthode appelée pour chaque HttpException.
   *
   * @param exception - L'exception HTTP capturée.
   * @param host - Contexte d'exécution.
   */
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Récupération de la réponse brute de l'exception
    const exceptionResponse = exception.getResponse() as ExceptionResponse;

    // Initialisation des valeurs par défaut
    let message = 'Http exception';
    let details: unknown = undefined;
    let code = exception.name; // Par défaut, le nom de l'exception

    // Analyse du type de exceptionResponse
    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else {
      // C'est un objet
      // Extraction sécurisée du message (peut être un string ou un array)
      if (typeof exceptionResponse.message === 'string') {
        message = exceptionResponse.message;
      } else if (Array.isArray(exceptionResponse.message)) {
        message = exceptionResponse.message.join(', ');
      }

      // Extraction du code métier personnalisé
      if (
        exceptionResponse.code &&
        typeof exceptionResponse.code === 'string'
      ) {
        code = exceptionResponse.code;
      }

      // Extraction des détails si présents
      if ('details' in exceptionResponse) {
        details = exceptionResponse.details;
      }
    }

    // Log de l'erreur
    this.logger.error(
      `${request.method} ${request.url} ${status} - ${message}`,
    );

    // Construction de la réponse
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined && { details }),
      },
      timestamp: new Date().toISOString(),
      path: request.url,
      statusCode: status,
    };

    response.status(status).json(errorResponse);
  }
}
