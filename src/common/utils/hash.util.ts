import * as bcrypt from 'bcrypt';

/**
 * Utilitaire pour le hachage et la comparaison de mots de passe.
 * Utilise bcrypt avec un nombre de rounds configurable.
 */
export class HashUtil {
  /**
   * Hache une chaîne avec bcrypt.
   * @param data Chaîne à hacher (mot de passe)
   * @param rounds Nombre de rounds (salt), par défaut 12
   * @returns Le hash
   */
  static async hash(data: string, rounds = 12): Promise<string> {
    return bcrypt.hash(data, rounds);
  }

  /**
   * Compare une chaîne en clair avec un hash.
   * @param data Chaîne en clair
   * @param hash Hash stocké
   * @returns true si correspond, false sinon
   */
  static async compare(data: string, hash: string): Promise<boolean> {
    return bcrypt.compare(data, hash);
  }
}
