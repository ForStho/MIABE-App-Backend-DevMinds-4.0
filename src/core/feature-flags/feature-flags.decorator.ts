import { SetMetadata } from '@nestjs/common';

/**
 * Clé utilisée pour stocker les métadonnées du feature flag dans les handlers/classes.
 */
export const FEATURE_FLAG_KEY = 'feature_flag';

/**
 * Décorateur pour associer un feature flag à une route ou à un contrôleur.
 *
 * Exemple d'utilisation :
 * ```typescript
 * @FeatureFlag('new-checkout')
 * @Post('checkout')
 * async checkout() { ... }
 * ```
 *
 * Le guard `FeatureFlagGuard` lira cette métadonnée et vérifiera si le flag est activé.
 *
 * @param flag - Nom du feature flag (sans préfixe FEATURE_)
 * @returns Métadonnée pour le guard
 */
export const FeatureFlag = (flag: string) =>
  SetMetadata(FEATURE_FLAG_KEY, flag);
