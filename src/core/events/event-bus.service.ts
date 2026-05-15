import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Service façade pour le bus d'événements.
 *
 * Ce service encapsule `EventEmitter2` et fournit une interface simple
 * pour émettre des événements (synchrones ou asynchrones) et s'y abonner.
 *
 * Il est utilisé comme un bus d'événements interne pour la communication
 * entre modules découplés.
 */
@Injectable()
export class EventBusService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Émet un événement de manière synchrone.
   * Tous les listeners attachés à cet événement seront exécutés immédiatement.
   *
   * @param event - Nom de l'événement (peut utiliser des wildcards si configuré)
   * @param payload - Données associées à l'événement
   */
  emit(event: string, payload: unknown): void {
    this.eventEmitter.emit(event, payload);
  }

  /**
   * Émet un événement de manière asynchrone.
   * Les listeners peuvent retourner des Promesses, et cette méthode attend
   * leur résolution. Utile pour des opérations qui doivent être terminées
   * avant de continuer.
   *
   * @param event - Nom de l'événement
   * @param payload - Données associées
   * @returns Un tableau de booléens indiquant le succès de chaque listener
   */
  async emitAsync(event: string, payload: unknown): Promise<boolean[]> {
    // EventEmitter2.emitAsync retourne Promise<any[]>, mais en réalité c'est un tableau de booléens.
    // On caste pour respecter le type attendu.
    return (await this.eventEmitter.emitAsync(event, payload)) as boolean[];
  }

  /**
   * Enregistre un listener pour un événement donné.
   *
   * @param event - Nom de l'événement (peut être avec wildcard)
   * @param listener - Fonction appelée quand l'événement est émis
   */
  on(event: string, listener: (payload: unknown) => void): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Enregistre un listener qui ne sera exécuté qu'une seule fois.
   * Après la première émission, le listener est automatiquement retiré.
   *
   * @param event - Nom de l'événement
   * @param listener - Fonction à appeler
   */
  once(event: string, listener: (payload: unknown) => void): void {
    this.eventEmitter.once(event, listener);
  }

  /**
   * Retire un listener spécifique d'un événement.
   *
   * @param event - Nom de l'événement
   * @param listener - La fonction à retirer (doit être la même référence que celle ajoutée)
   */
  off(event: string, listener: (payload: unknown) => void): void {
    this.eventEmitter.off(event, listener);
  }

  /**
   * Supprime tous les listeners d'un événement, ou tous les listeners si aucun événement n'est spécifié.
   *
   * @param event - Événement optionnel
   */
  removeAllListeners(event?: string): void {
    this.eventEmitter.removeAllListeners(event);
  }
}
