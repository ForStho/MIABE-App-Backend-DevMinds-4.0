/**
 * Décorateur de fallback.
 * Fournit une valeur de repli en cas d'échec.
 */
export function Fallback(fallbackValue: any) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch {
        return typeof fallbackValue === 'function'
          ? fallbackValue()
          : fallbackValue;
      }
    };

    return descriptor;
  };
}
