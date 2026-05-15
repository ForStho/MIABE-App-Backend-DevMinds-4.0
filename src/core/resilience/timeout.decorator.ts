/**
 * Décorateur de timeout.
 * Lance une erreur si la méthode dépasse la durée spécifiée.
 */
export function Timeout(ms: number) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
      });
      return Promise.race([originalMethod.apply(this, args), timeoutPromise]);
    };

    return descriptor;
  };
}
