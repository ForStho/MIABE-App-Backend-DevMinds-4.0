/**
 * DTO pour une réponse de succès standardisée.
 * Correspond au format utilisé par ResponseInterceptor.
 */
export class SuccessResponseDto<T> {
  success: true; // toujours true
  data: T; // Données de la réponse
  timestamp: string;
  path: string;
  statusCode: number;
}
