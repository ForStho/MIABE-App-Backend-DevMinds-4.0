import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UserDocument } from '../../modules/users/schemas/user.schema';

/**
 * Type pour l'utilisateur authentifié (peut être null si non authentifié)
 */
type AuthenticatedUser = UserDocument | null;

/**
 * Type pour les informations supplémentaires retournées par Passport
 */
type AuthInfo = any; // Garder any ici car Passport peut retourner diverses informations

/**
 * Guard d'authentification JWT.
 *
 * Ce guard utilise la stratégie Passport 'jwt' pour valider le token JWT.
 * Il vérifie si la route est marquée comme publique (@Public()) et autorise l'accès sans token.
 * En cas d'échec, il lance une UnauthorizedException personnalisée.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Détermine si la requête peut être activée.
   *
   * @param context - Contexte d'exécution.
   * @returns true si la route est publique, sinon délègue à Passport.
   */
  canActivate(context: ExecutionContext) {
    // Vérifie la présence de la métadonnée 'isPublic' sur la route ou le contrôleur
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true; // Accès public, pas d'authentification
    }
    return super.canActivate(context);
  }

  /**
   * Personnalise la gestion du résultat de l'authentification.
   * La signature doit correspondre exactement à celle de la classe parente.
   *
   * @param err - Erreur éventuelle survenue lors de la validation.
   * @param user - Utilisateur authentifié (si succès).
   * @param info - Informations supplémentaires.
   * @param context - Contexte d'exécution (ajouté dans la signature parente).
   * @param status - Statut optionnel.
   * @returns L'utilisateur authentifié.
   * @throws UnauthorizedException si l'authentification échoue.
   */
  handleRequest<TUser = UserDocument>(
    err: Error | null,
    user: TUser | null,
    info: AuthInfo,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    if (err || !user) {
      // On peut personnaliser le message selon la raison de l'échec
      const message = err?.message || 'Invalid or missing token';
      throw new UnauthorizedException(message);
    }
    return user;
  }
}