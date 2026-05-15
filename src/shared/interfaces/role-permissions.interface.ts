import { Role } from '../constants/roles.enum';
import { Permission } from '../constants/permissions.enum';

/**
 * Interface représentant l'association entre un rôle et un ensemble de permissions.
 * Utilisée pour la gestion dynamique des permissions.
 */
export interface RolePermissions {
  role: Role;
  permissions: Permission[];
}
