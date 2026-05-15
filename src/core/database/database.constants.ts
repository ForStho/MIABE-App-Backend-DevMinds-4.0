/**
 * Constantes pour le module database.
 * Utilisées comme tokens d'injection pour les providers personnalisés.
 *
 * Ces constantes permettent d'éviter les erreurs de frappe et de centraliser
 * les identifiants utilisés avec `@Inject()` ou dans les modules dynamiques.
 */
export const DATABASE_CONNECTION_NAME = 'DATABASE_CONNECTION_NAME';
export const DATABASE_MODULE_OPTIONS = 'DATABASE_MODULE_OPTIONS';
