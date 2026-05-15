import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FeatureFlagsService } from './feature-flags.service';
import { FEATURE_FLAG_KEY } from './feature-flags.decorator';

/**
 * Guard qui vérifie l'état d'un feature flag avant d'autoriser l'accès à une route.
 *
 * Il utilise le `Reflector` pour récupérer le flag associé via le décorateur `@FeatureFlag()`.
 * Si aucun flag n'est défini, l'accès est autorisé (true).
 * Sinon, il interroge `FeatureFlagsService.isEnabled(flag)`.
 */
@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private featureFlagsService: FeatureFlagsService,
  ) {}

  /**
   * Détermine si la requête peut passer.
   *
   * @param context - Contexte d'exécution (contient la classe et le handler)
   * @returns true si le flag est activé ou absent, false sinon
   */
  canActivate(context: ExecutionContext): boolean {
    // Récupère le flag défini sur le handler ou la classe
    const flag = this.reflector.getAllAndOverride<string>(FEATURE_FLAG_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si aucun flag n'est requis, on autorise
    if (!flag) return true;

    // Vérifie l'état du flag
    return this.featureFlagsService.isEnabled(flag);
  }
}
