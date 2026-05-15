/**
 * Interface pour les options de pagination.
 * Toutes les propriétés sont requises après validation.
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Interface pour une réponse paginée.
 */
export interface PaginatedResult<T> {
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

/**
 * Utilitaire pour construire une réponse paginée de manière cohérente.
 */
export class PaginationUtil {
  /**
   * Crée une réponse paginée à partir des données.
   * @param data - Les données de la page courante
   * @param total - Nombre total d'éléments
   * @param options - Options de pagination (page et limit validés)
   */
  static paginate<T>(
    data: T[],
    total: number,
    options: PaginationOptions,
  ): PaginatedResult<T> {
    const { page, limit } = options;
    
    // Calcul du nombre total de pages
    const totalPages = Math.ceil(total / limit);
    
    // Détermination des pages suivante/précédente
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  /**
   * Calcule le skip pour une requête MongoDB.
   * @param page - Numéro de page (commence à 1)
   * @param limit - Nombre d'éléments par page
   * @returns Le nombre d'éléments à sauter
   */
  static getSkip(page: number, limit: number): number {
    if (page < 1 || limit < 1) {
      return 0;
    }
    return (page - 1) * limit;
  }
}