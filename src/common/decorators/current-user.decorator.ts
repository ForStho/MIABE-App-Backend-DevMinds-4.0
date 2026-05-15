import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserDocument } from '../../modules/users/schemas/user.schema'; // À adapter

/**
 * Interface représentant une requête HTTP contenant l'utilisateur authentifié.
 * Cette interface étend la Request d'Express pour typer la propriété `user`
 * qui est généralement ajoutée par le JwtAuthGuard.
 */
interface RequestWithUser extends Request {
  user: UserDocument;
}

/**
 * Décorateur de paramètre permettant d'extraire l'utilisateur courant depuis la requête.
 *
 * Ce décorateur est conçu pour être utilisé dans les contrôleurs après que
 * l'utilisateur a été attaché à la requête par un guard d'authentification (ex: JwtAuthGuard).
 *
 * @example
 * // Récupérer l'objet utilisateur complet
 * @Get('profile')
 * getProfile(@CurrentUser() user: UserDocument) {
 *   return user;
 * }
 *
 * @example
 * // Récupérer une propriété spécifique (ex: l'email)
 * @Get('profile/email')
 * getEmail(@CurrentUser('email') email: string) {
 *   return email;
 * }
 *
 * @param data - (optionnel) Clé de la propriété à extraire de l'objet user.
 * @param ctx - Contexte d'exécution (HTTP, RPC, WebSocket).
 * @returns L'utilisateur complet ou la propriété demandée, ou null si absent.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof UserDocument | undefined, ctx: ExecutionContext) => {
    // Récupération de la requête HTTP typée
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // Si aucun utilisateur n'est présent (ex: route publique sans guard),
    // on retourne null pour éviter une erreur. Le contrôleur devra gérer ce cas.
    if (!user) {
      return null;
    }

    // Si une clé spécifique est demandée, on retourne la valeur correspondante
    if (data) {
      return user[data];
    }

    // Sinon, on retourne l'objet complet
    return user;
  },
);
