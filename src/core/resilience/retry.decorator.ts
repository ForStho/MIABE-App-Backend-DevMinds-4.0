/**
 * Interface pour les options du décorateur Retry
 */
export interface RetryOptions {
  maxAttempts?: number;
  backoff?: number; // délai initial en ms
  backoffMultiplier?: number; // multiplicateur pour backoff exponentiel
}

/**
 * Décorateur de retry.
 * Réessaie une méthode en cas d'échec avec backoff exponentiel.
 * 
 * @param options - Options de configuration
 * @returns Décorateur de méthode
 */
export function Retry(options: RetryOptions = {}) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (this: unknown, ...args: unknown[]): Promise<unknown> {
      const maxAttempts = options.maxAttempts ?? 3;
      const baseBackoff = options.backoff ?? 1000;
      const multiplier = options.backoffMultiplier ?? 2;
      
      let lastError: Error = new Error('No attempts made'); // Initialisation explicite

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          // Capture et typage de l'erreur
          lastError = error instanceof Error 
            ? error 
            : new Error(String(error));
          
          if (attempt === maxAttempts) {
            break;
          }
          
          // Calcul du délai avec backoff exponentiel
          const delay = baseBackoff * Math.pow(multiplier, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      throw lastError;
    };

    return descriptor;
  };
}