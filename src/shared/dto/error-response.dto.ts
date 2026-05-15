/**
 * DTO pour une réponse d'erreur standardisée.
 * Correspond au format utilisé par HttpExceptionFilter.
 */
export class ErrorResponseDto {
  success: false; // toujours false
  error: {
    code: string; // Code d'erreur métier (ex: 'USER_NOT_FOUND')
    message: string; // Message lisible
    details?: any; // Informations supplémentaires (optionnel)
  };
  timestamp: string; // Date ISO
  path: string; // Chemin de la requête
  statusCode: number; // Code HTTP
}
