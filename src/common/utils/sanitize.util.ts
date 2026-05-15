/**
 * Utilitaire pour nettoyer les objets de champs sensibles.
 * Peut être utilisé avant de renvoyer des données au client.
 */
export class SanitizeUtil {
  /**
   * Supprime les champs sensibles d'un objet ou d'un tableau d'objets.
   * Par défaut, supprime 'password', '__v', 'deletedAt'.
   * @param obj Objet ou tableau à nettoyer
   * @param fieldsToRemove Champs supplémentaires à supprimer
   * @returns Une copie nettoyée de l'objet
   */
  static sanitize<T>(obj: T, fieldsToRemove: string[] = []): T {
    const defaultFields = ['password', '__v', 'deletedAt'];
    const fields = [...defaultFields, ...fieldsToRemove];

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item, fields)) as any;
    }
    return this.sanitizeObject(obj, fields);
  }

  private static sanitizeObject<T>(obj: T, fields: string[]): T {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }
    const sanitized = { ...obj };
    for (const field of fields) {
      delete sanitized[field];
    }
    return sanitized;
  }
}
