import { SetMetadata } from '@nestjs/common';
import { Permission } from '../../shared/constants/permissions.enum';

/**
 * Clé utilisée pour stocker les permissions requises dans les métadonnées de la route.
 * Cette clé sera lue par le PermissionsGuard.
 */
export const PERMISSIONS_KEY = 'permissions';

/**
 * Décorateur qui spécifie les permissions nécessaires pour accéder à une route.
 *
 * Le guard associé (PermissionsGuard) vérifiera que l'utilisateur possède
 * au moins une des permissions listées (selon la configuration du guard).
 *
 * @param permissions - Liste des permissions requises (au moins une doit être possédée).
 * @returns Métadonnées attachées à la route.
 *
 * @example
 * @RequirePermission(Permission.READ_USER, Permission.UPDATE_USER)
 * @Get()
 * findAll() { ... }
 */
export const RequirePermission = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
