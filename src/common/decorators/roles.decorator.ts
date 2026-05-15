import { SetMetadata } from '@nestjs/common';
import { Role } from '../../shared/constants/roles.enum';

export const ROLES_KEY = 'roles';

/**
 * Décorateur pour spécifier les rôles autorisés sur une route.
 * Utilisé conjointement avec RolesGuard.
 *
 * Exemple :
 * @Roles(Role.ADMIN, Role.MODERATOR)
 * @Get('admin')
 * adminOnly() { ... }
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
