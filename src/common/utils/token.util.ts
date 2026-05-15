import { randomBytes } from 'crypto';

/**
 * Utilitaire pour générer des tokens aléatoires (ex: pour les refresh tokens, les liens de confirmation).
 */
export class TokenUtil {
  /**
   * Génère un token aléatoire de la longueur spécifiée (en octets, puis encodé en hex).
   * @param bytes Nombre d'octets (par défaut 32 -> 64 caractères hex)
   * @returns Token hexadécimal
   */
  static generateRandomToken(bytes = 32): string {
    return randomBytes(bytes).toString('hex');
  }

  /**
   * Génère un token numérique (ex: code à 6 chiffres).
   * @param length Nombre de chiffres
   * @returns Token numérique
   */
  static generateNumericToken(length = 6): string {
    let token = '';
    for (let i = 0; i < length; i++) {
      token += Math.floor(Math.random() * 10);
    }
    return token;
  }
}
