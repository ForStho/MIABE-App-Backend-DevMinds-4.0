/**
 * =====================================================================
 * HTTP STATUS CODES
 * =====================================================================
 *
 * Ce fichier centralise les codes de statut HTTP utilisés dans l'application.
 *
 * Pourquoi utiliser des constantes plutôt que des nombres ?
 *
 * 1️⃣ Évite les "magic numbers" dans le code
 *    Exemple mauvais :
 *        return res.status(404)
 *
 *    Exemple propre :
 *        return res.status(HTTP_STATUS.NOT_FOUND)
 *
 * 2️⃣ Améliore la lisibilité du code
 *    On comprend immédiatement l'intention.
 *
 * 3️⃣ Permet l'autocomplétion TypeScript
 *
 * 4️⃣ Facilite la maintenance
 *    Si une logique doit être modifiée ou documentée,
 *    tout est centralisé dans un seul fichier.
 *
 * Les codes HTTP sont standardisés par la spécification HTTP :
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 *
 * ---------------------------------------------------------------------
 * Organisation des codes :
 *
 * 1xx → Informations
 * 2xx → Succès
 * 3xx → Redirection
 * 4xx → Erreur côté client
 * 5xx → Erreur côté serveur
 *
 * Dans la plupart des APIs REST, on utilise principalement :
 * - 2xx
 * - 4xx
 * - 5xx
 *
 * =====================================================================
 */

export const HTTP_STATUS = {
  /**
   * ===============================================================
   * 2xx — SUCCESS
   * ===============================================================
   * La requête a été traitée avec succès par le serveur.
   */

  /** Requête réussie */
  OK: 200,

  /** Ressource créée avec succès (souvent après POST) */
  CREATED: 201,

  /** Requête acceptée mais traitement asynchrone */
  ACCEPTED: 202,

  /** Succès sans contenu retourné (ex: DELETE) */
  NO_CONTENT: 204,

  /**
   * ===============================================================
   * 4xx — CLIENT ERRORS
   * ===============================================================
   * Le problème vient de la requête envoyée par le client.
   */

  /** Requête invalide (paramètres incorrects, validation échouée) */
  BAD_REQUEST: 400,

  /** Authentification requise ou invalide */
  UNAUTHORIZED: 401,

  /** Accès refusé malgré une authentification valide */
  FORBIDDEN: 403,

  /** Ressource introuvable */
  NOT_FOUND: 404,

  /** Méthode HTTP non autorisée pour cette route */
  METHOD_NOT_ALLOWED: 405,

  /** Conflit avec l'état actuel de la ressource (ex: duplication) */
  CONFLICT: 409,

  /** Validation échouée (souvent utilisé avec DTO validation) */
  UNPROCESSABLE_ENTITY: 422,

  /** Trop de requêtes envoyées (rate limiting / throttling) */
  TOO_MANY_REQUESTS: 429,

  /**
   * ===============================================================
   * 5xx — SERVER ERRORS
   * ===============================================================
   * Le serveur a rencontré une erreur interne.
   */

  /** Erreur interne inattendue du serveur */
  INTERNAL_SERVER_ERROR: 500,

  /** Mauvaise réponse d'un service en amont (proxy, microservice) */
  BAD_GATEWAY: 502,

  /** Service temporairement indisponible */
  SERVICE_UNAVAILABLE: 503,

  /** Timeout lors de la communication avec un service externe */
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * =====================================================================
 * TYPE TYPESCRIPT POUR LES CODES HTTP
 * =====================================================================
 *
 * Ce type permet de restreindre les valeurs possibles
 * uniquement aux codes définis dans HTTP_STATUS.
 *
 * Exemple :
 *
 * function sendResponse(status: HttpStatusCode) {}
 *
 * sendResponse(200)   ✅
 * sendResponse(404)   ✅
 * sendResponse(999)   ❌ erreur TypeScript
 *
 * Cela garantit la sécurité du typage et évite
 * l'utilisation de codes HTTP invalides.
 */
export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
