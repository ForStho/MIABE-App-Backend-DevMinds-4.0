import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Opossum from 'opossum';

/**
 * Interface pour les options du circuit breaker
 */
export interface CircuitBreakerOptions {
  timeout?: number; // en ms
  errorThresholdPercentage?: number; // 0-100
  resetTimeout?: number; // en ms
  rollingCountTimeout?: number; // en ms
  rollingCountBuckets?: number;
  name?: string;
  group?: string;
  volumeThreshold?: number;
  errorFilter?: (error: Error) => boolean;
  cache?: boolean;
  enabled?: boolean;
}

/**
 * Type pour le décorateur CircuitBreaker
 * Utilise Opossum pour protéger les appels à des services externes.
 * 
 * @param options Options du circuit breaker
 * @returns Décorateur de méthode
 */
export function CircuitBreaker(options: CircuitBreakerOptions = {}) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;
    const logger = new Logger('CircuitBreaker');

    descriptor.value = async function (this: any, ...args: unknown[]) {
      // Récupération du ConfigService depuis l'instance (si disponible)
      const configService: ConfigService | undefined = this.configService;

      // Fusion des options avec la configuration
      const circuitBreakerOptions: Opossum.Options = {
        timeout: options.timeout ?? configService?.get('resilience.circuitBreaker.timeout') ?? 5000,
        errorThresholdPercentage:
          options.errorThresholdPercentage ??
          configService?.get('resilience.circuitBreaker.errorThreshold') ??
          50,
        resetTimeout: options.resetTimeout ?? configService?.get('resilience.circuitBreaker.resetTimeout') ?? 30000,
        rollingCountTimeout: options.rollingCountTimeout ?? 10000,
        rollingCountBuckets: options.rollingCountBuckets ?? 10,
        volumeThreshold: options.volumeThreshold ?? 5,
        enabled: options.enabled ?? true,
        name: options.name ?? propertyKey,
      };

      // Création du breaker avec la méthode originale bindée
      const breaker = new Opossum(
        originalMethod.bind(this),
        circuitBreakerOptions
      );

      // Ajout des listeners pour le logging
      breaker.on('open', () =>
        logger.warn(`Circuit breaker opened for ${propertyKey}`)
      );
      breaker.on('close', () =>
        logger.log(`Circuit breaker closed for ${propertyKey}`)
      );
      breaker.on('halfOpen', () =>
        logger.log(`Circuit breaker half-open for ${propertyKey}`)
      );
      breaker.on('fallback', (result: unknown) =>
        logger.debug(`Circuit breaker fallback executed for ${propertyKey}`, result)
      );
      breaker.on('reject', (error: Error) =>
        logger.error(`Circuit breaker rejected request for ${propertyKey}`, error.stack)
      );

      // Exécution de la méthode protégée
      return breaker.fire(...args);
    };

    return descriptor;
  };
}