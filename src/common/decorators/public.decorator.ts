import { SetMetadata } from '@nestjs/common';

/**
 * Clé utilisée pour stocker la métadonnée "public".
 * Les guards d'authentification peuvent vérifier cette métadonnée pour
 * autoriser l'accès sans token.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Décorateur pour marquer une route comme publique (sans authentification).
 * À utiliser en complément du JwtAuthGuard global.
 *
 * Exemple :
 * @Public()
 * @Get('health')
 * healthCheck() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
