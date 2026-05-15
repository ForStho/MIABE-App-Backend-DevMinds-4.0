import { Role } from '../constants/roles.enum';
import { Permission } from '../constants/permissions.enum';

/**
 * Interface représentant un utilisateur.
 * Cette interface peut être partagée entre plusieurs modules (auth, users, etc.).
 * Elle ne contient que les champs nécessaires pour le typage, pas la logique de schéma.
 */
export interface IUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: Role[];
  permissions?: Permission[]; // Optionnel car peut être dérivé des rôles
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
