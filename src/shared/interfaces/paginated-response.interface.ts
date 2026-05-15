/**
 * Interface générique pour une réponse paginée.
 * Utilisée par PaginationUtil et les contrôleurs pour typer les retours.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Alias pour la compatibilité avec le service
export type PaginatedResult<T> = PaginatedResponse<T>;