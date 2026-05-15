/**
 * Constante pour l'injection du bus d'événements.
 *
 * Bien que nous utilisions directement le service `EventBusService` (injectable),
 * cette constante pourrait être utilisée si on souhaitait fournir le bus sous
 * un token différent (ex: pour des tests ou pour une implémentation alternative).
 */
export const EVENT_BUS = 'EVENT_BUS';
